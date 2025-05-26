"use client";
import { WebinarWithPresenter } from "@/lib/type";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React, { useEffect, useState } from "react";
import {
  User as StreamUser,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import CustomLivestreamPlayer from "./CustomLivestreamPlayer";
import { getTokenForHost } from "@/app/actions/stream";

type Props = {
  apiKey: string;
  callId: string;
  user: User;
  webinar: WebinarWithPresenter;
};

const LiveStreamState = ({ apiKey, callId, webinar, user }: Props) => {
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  // const client = new StreamVideoClient({ apiKey, user: hostUser, hostToken });
  useEffect(() => {
    const init = async () => {
      try {
        const token = await getTokenForHost(
          webinar.presenterId,
          webinar.presenter.name,
          webinar.presenter.profileImage
        );
        const hostUser: StreamUser = {
          id: webinar.presenterId,
          name: webinar.presenter.name,
          image: webinar.presenter.profileImage,
        };
        const streamClient = new StreamVideoClient({
          apiKey,
          user: hostUser,
          token,
        });
        setHostToken(token);
        setClient(streamClient);
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, [apiKey, webinar]);
  if (!client || !hostToken) {
    return null;
  }
  return (
    <StreamVideo client={client}>
      <CustomLivestreamPlayer
        callId={callId}
        callType="livestream"
        webinar={webinar}
        username={user.name}
        token={hostToken}
      />
    </StreamVideo>
  );
};

export default LiveStreamState;
