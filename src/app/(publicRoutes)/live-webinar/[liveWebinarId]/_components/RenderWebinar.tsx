import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React from "react";
import WebinarUpcomingState from "./WebinarUpcomingState";

type Props = {
  apiKey: string;
  token: string;
  callId: string;
  checkUser: User | null;
  error: string;
  webinar: Webinar;
};

const RenderWebinar = ({
  apiKey,
  token,
  callId,
  checkUser,
  error,
  webinar,
}: Props) => {
  return (
    <React.Fragment>
      {webinar.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
        <WebinarUpcomingState
          webinar={webinar}
          currentUser={checkUser || null}
        />
      ) : (
        ""
      )}
    </React.Fragment>
  );
};

export default RenderWebinar;
