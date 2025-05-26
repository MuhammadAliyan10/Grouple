"use client";
import { WebinarWithPresenter } from "@/lib/type";
import { Webinar } from "@prisma/client";
import {
  Call,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import LiveWebinarView from "../Common/LiveWebinarView";

type Props = {
  callId: string;
  callType: string;
  webinar: WebinarWithPresenter;
  username: string;
  token: string;
};

const CustomLivestreamPlayer = ({
  callId,
  callType,
  webinar,
  username,
  token,
}: Props) => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call>();
  const [showChat, setShowChat] = useState(false);
  useEffect(() => {
    if (!client) {
      return;
    }
    const myCall = client.call(callType, callId);

    myCall
      .join({ create: true })
      .then(() => {
        setCall(myCall);
      })
      .catch((e) => console.log("Failed to join call", e));
    return () => setCall(undefined);
  }, [client, callId, callType]);
  if (!call) {
    return null;
  }
  return (
    <StreamCall call={call}>
      <LiveWebinarView
        showChat={showChat}
        setShowChat={setShowChat}
        webinar={webinar}
        isHost={true}
        username={username}
        userId={webinar.presenterId!}
        userToken={token}
        call={call}
      />
    </StreamCall>
  );
};

export default CustomLivestreamPlayer;
