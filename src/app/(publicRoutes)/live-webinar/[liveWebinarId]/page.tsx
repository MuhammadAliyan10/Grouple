import { onAuthenticateUser } from "@/app/actions/auth";
import { getWebinarById } from "@/app/actions/webinar";
import React from "react";
import RenderWebinar from "./_components/RenderWebinar";
import { StreamCallRecording, WebinarWithPresenter } from "@/lib/type";
import { WebinarStatusEnum } from "@prisma/client";

type Props = {
  params: Promise<{
    liveWebinarId: string;
  }>;
  searchParams: Promise<{
    error: string;
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { liveWebinarId } = await params;
  const { error } = await searchParams;
  let recording: null = null;

  const webinarData = await getWebinarById(liveWebinarId);

  if (!webinarData) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Webinar not found
      </div>
    );
  }
  // if (webinarData?.webinars.webinarStatus === WebinarStatusEnum.ENDED) {
  //   // recording = await getStreamRecoring(liveWebinarId)
  // }
  const checkUser = await onAuthenticateUser();
  if (!checkUser.user) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Kindly login to continue.
      </div>
    );
  }
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY! as string;
  return (
    <div className="w-full min-h-screen mx-auto">
      <RenderWebinar
        apiKey={apiKey}
        recording={null}
        checkUser={checkUser.user || null}
        error={error}
        webinar={webinarData as WebinarWithPresenter}
      />
    </div>
  );
};

export default page;
