import { onAuthenticateUser } from "@/app/actions/auth";
import { getWebinarById } from "@/app/actions/webinar";
import React from "react";
import RenderWebinar from "./_components/RenderWebinar";

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
  const webinarData = await getWebinarById(liveWebinarId);
  if (!webinarData) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Webinar not found
      </div>
    );
  }
  const checkUser = await onAuthenticateUser();
  if (!checkUser.user) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Kindly login to continue.
      </div>
    );
  }
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY! as string;
  const token = process.env.STREAM_TOKEN! as string;
  const callId = process.env.STREAM_CALL_ID! as string;
  return (
    <div className="w-full min-h-screen mx-auto">
      <RenderWebinar
        apiKey={apiKey}
        token={token}
        callId={callId}
        checkUser={checkUser.user || null}
        error={error}
        webinar={webinarData}
      />
    </div>
  );
};

export default page;
