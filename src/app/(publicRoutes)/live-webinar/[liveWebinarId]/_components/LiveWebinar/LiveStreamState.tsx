import { WebinarWithPresenter } from "@/lib/type";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React from "react";
import {
  User as StreamUser,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import CustomLivestreamPlayer from "./CustomLivestreamPlayer";

type Props = {
  apiKey: string;
  token: string;
  callId: string;
  user: User;
  webinar: WebinarWithPresenter;
};

const hostUser: StreamUser = { id: process.env.NEXT_PUBLIC_STREAM_USER_ID! };
const LiveStreamState = ({ apiKey, token, callId, webinar, user }: Props) => {
  const client = new StreamVideoClient({ apiKey, user: hostUser, token });
  return (
    <StreamVideo client={client}>
      <CustomLivestreamPlayer
        callId={callId}
        callType="livestream"
        webinar={webinar}
        username={user.name}
        token={token}
      />
    </StreamVideo>
  );
};

export default LiveStreamState;
