"use client";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer";
import Image from "next/image";
import WaitingListComponent from "./WaitingListComponent";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { changeWebinarStatus } from "@/app/actions/webinar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createAndStartStream } from "@/app/actions/stream";

type Props = {
  title: string;
  webinar: Webinar;
  currentUser: User | null;
};

const WebinarUpcomingState = ({ title, webinar, currentUser }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleStartWebinar = async () => {
    setLoading(true);
    try {
      if (!currentUser?.id) {
        throw new Error("User not authenticated.");
      }
      await createAndStartStream(webinar);
      const res = await changeWebinarStatus(webinar.id, "LIVE");
      if (!res?.success) {
        throw new Error(res?.message);
      }
      toast.success("Webinar stated successfully.");
      router.refresh();
    } catch (error) {
      console.log("Error");
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen mx-auto mx-w-[400px] flex flex-col justify-center items-center gap-8 py-20">
      <div className="space-y-2">
        <p className="text-3xl font-semibold text-primary text-center">
          {title}
        </p>
        <CountdownTimer
          targetDate={new Date(webinar.startTime)}
          className="text-center"
          webinarId={webinar.id}
          webinarStatus={webinar.webinarStatus}
        />
      </div>
      <div className="space-y-6 w-full h-full flex justify-center items-center flex-col">
        <div className="w-full max-w-md aspect-[4/3] relative rounded-4xl overflow-hidden mb-6">
          <Image
            src={"/darkThumbnail.avif"}
            alt={webinar.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        {webinar?.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
          <WaitingListComponent
            webinarStatus={"SCHEDULED"}
            webinarId={webinar.id}
          />
        ) : webinar.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
          <>
            {currentUser?.id === webinar.presenterId ? (
              <Button
                className="w-full max-w-[300px] font-semibold"
                disabled={loading}
                onClick={handleStartWebinar}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Starting...
                  </>
                ) : (
                  "Start Webinar"
                )}
              </Button>
            ) : (
              <WaitingListComponent
                webinarStatus={"WAITING_ROOM"}
                webinarId={webinar.id}
              />
            )}
          </>
        ) : webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
          <WaitingListComponent webinarStatus={"LIVE"} webinarId={webinar.id} />
        ) : webinar.webinarStatus === WebinarStatusEnum.CANCELLED ? (
          <p className="text-xl text-foreground text-center font-semibold">
            Webinar Canceled!
          </p>
        ) : (
          <Button>Ended</Button>
        )}
      </div>
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-primary">{webinar.title}</h3>
        <p className="text-muted-foreground text-xs">{webinar.description}</p>
        <div className="w-full flex justify-center items-center gap-2 flex-wrap">
          <Button
            variant={"outline"}
            className="rounded-md bg-secondary backdrop-blur-2xl"
          >
            <Calendar className="mr-2 " />
            {format(new Date(webinar.startTime), "dd MMMM yyyy")}
          </Button>
          <Button variant={"outline"}>
            <Clock className="mr-2 " />
            {format(new Date(webinar.startTime), "hh:mm a")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebinarUpcomingState;
