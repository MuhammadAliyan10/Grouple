"use client";
import { User, Webinar } from "@prisma/client";
import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer";

type Props = {
  webinar: Webinar;
  currentUser: User | null;
};

const WebinarUpcomingState = ({ webinar, currentUser }: Props) => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="w-full min-h-screen mx-auto mx-w-[400px] flex flex-col justify-center items-center gap-8 py-20">
      <div className="space-y-2">
        <p className="text-3xl font-semibold text-primary text-center">
          Seems like you are little early.
        </p>
        <CountdownTimer
          targetDate={new Date(webinar.startTime)}
          className="text-center"
          webinarId={webinar.id}
          webinarStatus={webinar.webinarStatus}
        />
      </div>
    </div>
  );
};

export default WebinarUpcomingState;
