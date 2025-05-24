"use client";
import { registerAttendee } from "@/app/actions/attendance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { WebinarStatusEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  webinarId: string;
  webinarStatus: WebinarStatusEnum;
  onRegistered?: () => void;
};

const WaitingListComponent = ({
  webinarId,
  webinarStatus,
  onRegistered,
}: Props) => {
  const [open, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { setAttendee } = useAttendeeStore();
  const buttonText = () => {
    switch (webinarStatus) {
      case WebinarStatusEnum.SCHEDULED:
        return "Get Reminder";

      case WebinarStatusEnum.WAITING_ROOM:
        return "Get Reminder";

      case WebinarStatusEnum.LIVE:
        return "Join Webinar";

      default:
        return "Register";
    }
  };
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await registerAttendee(email, name, webinarId);
      if (!res.success) {
        throw new Error(res.message || "Something went wrong.");
      }
      if (res.data?.user) {
        setAttendee({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          callStatus: "PENDING",
        });
      }
      toast.success(
        webinarStatus === WebinarStatusEnum.LIVE
          ? "Successfully joined the webinar"
          : "Successfully registered for the webinar"
      );

      setName("");
      setEmail("");
      setSubmitted(true);

      setTimeout(() => {
        setIsOpen(false);
        if (webinarStatus === WebinarStatusEnum.LIVE) {
          router.refresh();
        }
        if (onRegistered) onRegistered();
      }, 1500);
    } catch (error) {
      console.log("Error");
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${
            webinarStatus === WebinarStatusEnum.LIVE
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          }" rounded-md px-4 py-2 text-primary-foreground text-sm font-semibold`}
        >
          {webinarStatus === WebinarStatusEnum.LIVE && (
            <span className="mr-2 h-2 w-2 bg-white rounded-full animate-pulse"></span>
          )}
          {buttonText()}
        </Button>
      </DialogTrigger>
      <DialogContent
        isHideCloseButton={false}
        className="border-0 bg-transparent"
      >
        <DialogHeader className="justify-center items-center border border-input rounded-xl p-4 bg-background">
          <DialogTitle className="text-center text-lg font-semibold mb-4">
            {webinarStatus === WebinarStatusEnum.LIVE
              ? "Join the Webinar"
              : "Join the WaitList"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {!submitted && (
            <React.Fragment>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </React.Fragment>
          )}
          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting || submitted}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                {webinarStatus === WebinarStatusEnum.LIVE
                  ? "Joining..."
                  : "Registering..."}
              </>
            ) : submitted ? (
              webinarStatus === WebinarStatusEnum.LIVE ? (
                "You're all set to join!"
              ) : (
                "You're Successfully joined the WaitList!"
              )
            ) : webinarStatus === WebinarStatusEnum.LIVE ? (
              "Join Now"
            ) : (
              "Join WaitList"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WaitingListComponent;
