"use client";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React, { useEffect } from "react";
import WebinarUpcomingState from "./WebinarUpcomingState";
import { usePathname, useRouter } from "next/navigation";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { toast } from "sonner";
import LiveStreamState from "./LiveWebinar/LiveStreamState";
import { StreamCallRecording, WebinarWithPresenter } from "@/lib/type";
import Participant from "./Particiapnt/Participant";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import Link from "next/link";

type Props = {
  apiKey: string;
  checkUser: User | null;
  error: string;
  webinar: WebinarWithPresenter;
  recording: StreamCallRecording | null;
};

const RenderWebinar = ({
  apiKey,
  recording,
  checkUser,
  error,
  webinar,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { attendee } = useAttendeeStore();
  useEffect(() => {
    if (error) {
      toast.error(error);
      router.push(pathname);
    }
  }, [error]);
  return (
    <React.Fragment>
      {webinar.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
        <WebinarUpcomingState
          title="The webinar has not yet started. Please check back closer to the scheduled time."
          webinar={webinar}
          currentUser={checkUser || null}
        />
      ) : webinar?.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
        <WebinarUpcomingState
          title="The webinar is about to begin. Please stand by."
          webinar={webinar}
          currentUser={checkUser || null}
        />
      ) : webinar?.webinarStatus === WebinarStatusEnum.LIVE ? (
        <React.Fragment>
          {checkUser?.id === webinar.presenterId ? (
            <LiveStreamState
              apiKey={apiKey}
              token={token}
              callId={callId}
              webinar={webinar}
              user={checkUser}
            />
          ) : attendee ? (
            <Participant apiKey={apiKey} webinar={webinar} callId={callId} />
          ) : (
            <WebinarUpcomingState
              title="The webinar is about to begin. Please stand by."
              webinar={webinar}
              currentUser={checkUser || null}
            />
          )}
        </React.Fragment>
      ) : webinar?.webinarStatus === WebinarStatusEnum.CANCELLED ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-primary">
              {webinar.title}
            </h3>
            <p className="text-muted-foreground text-xs">
              We regret to inform you that this webinar has been cancelled.
            </p>
          </div>
        </div>
      ) : webinar?.webinarStatus === WebinarStatusEnum.ENDED ? (
        <div className="flex justify-center items-center h-screen w-full">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-primary">
              {webinar.title}
            </h3>
            <p className="text-muted-foreground text-xs">
              This webinar has concluded. Thank you for your interest.
            </p>
            <Link href={"/webinars"}>
              <Button variant={"outline"}>
                <Undo2 className="w-4 h-4 mr-1" />
                Go back
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <WebinarUpcomingState
          title="The webinar is about to begin. Please stand by."
          webinar={webinar}
          currentUser={checkUser || null}
        />
      )}
    </React.Fragment>
  );
};

export default RenderWebinar;
