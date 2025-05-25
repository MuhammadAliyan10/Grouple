"use client";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React, { useEffect } from "react";
import WebinarUpcomingState from "./WebinarUpcomingState";
import { usePathname, useRouter } from "next/navigation";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { toast } from "sonner";
import LiveStreamState from "./LiveWebinar/LiveStreamState";
import { WebinarWithPresenter } from "@/lib/type";
import Participant from "./Particiapnt/Participant";

type Props = {
  apiKey: string;
  token: string;
  callId: string;
  checkUser: User | null;
  error: string;
  webinar: WebinarWithPresenter;
};

const RenderWebinar = ({
  apiKey,
  token,
  callId,
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
          webinar={webinar}
          currentUser={checkUser || null}
        />
      ) : webinar?.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
        <WebinarUpcomingState
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
              This webinar has been canceled.
            </p>
          </div>
        </div>
      ) : (
        <WebinarUpcomingState
          webinar={webinar}
          currentUser={checkUser || null}
        />
      )}
    </React.Fragment>
  );
};

export default RenderWebinar;
