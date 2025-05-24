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
    setCall(myCall);
    myCall.join().catch((e) => console.log("Failed to join call", e));
    return () => {
      myCall.leave().catch((e) => console.log("Failed to leave call", e));
      setCall(undefined);
    };
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
        userId={process.env.NEXT_PUBLIC_STREAM_USER_ID!}
        userToken={token}
      />
    </StreamCall>
  );
};

export default CustomLivestreamPlayer;
