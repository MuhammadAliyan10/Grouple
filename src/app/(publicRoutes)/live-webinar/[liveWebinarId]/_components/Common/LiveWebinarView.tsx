"use client";
import { WebinarWithPresenter } from "@/lib/type";
import { Loader2, MessageSquare, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  ParticipantView,
  useCallStateHooks,
  Call,
} from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { CtaTypeEnum } from "@prisma/client";
import "stream-chat-react/dist/css/v2/index.css";
import CTADialogBox from "./CTADialogBox";
import { changeWebinarStatus } from "@/app/actions/webinar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ObsDialogBox from "./ObsDialogBox";

type Props = {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  webinar: WebinarWithPresenter;
  isHost?: boolean;
  username: string;
  userId: string;
  call: Call;
  userToken: string;
};

const LiveWebinarView = ({
  showChat,
  setShowChat,
  webinar,
  isHost,
  username,
  userId,
  userToken,
  call,
}: Props) => {
  const { useParticipantCount, useParticipants } = useCallStateHooks();
  const viewersCount = useParticipantCount();
  const participants = useParticipants();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [obsDialogOpen, setObsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hostParticipant = participants.length > 0 ? participants[0] : null;
  const router = useRouter();

  const handleEndStream = async () => {
    setLoading(true);
    try {
      call.stopLive({
        continue_recording: false,
      });
      call.endCall();
      const webinarState = await changeWebinarStatus(webinar.id, "ENDED");
      if (!webinarState?.success) {
        toast.error(webinarState?.message);
      } else {
        toast.success("Stream ended successfully.");
        router.refresh();
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const initChat = async () => {
      if (!userId || !userToken || !username) {
        setError("Missing userId, userToken, or username");
        return;
      }
      if (!process.env.NEXT_PUBLIC_STREAM_API_KEY) {
        setError("Stream API key is not defined");
        return;
      }

      try {
        console.log("Initializing chat with:", { userId, userToken, username });
        const client = StreamChat.getInstance(
          process.env.NEXT_PUBLIC_STREAM_API_KEY
        );

        await client.connectUser(
          {
            id: userId,
            name: username,
          },
          userToken
        );
        console.log("User connected successfully");
        const channel = client.channel("livestream", webinar.id, {
          name: webinar.title,
        });
        await channel.watch();
        console.log("Channel watched successfully");
        setChatClient(client);
        setChannel(channel);
        setError(null);
      } catch (err: any) {
        console.error("Failed to initialize chat:", err);
        setError(
          err.message.includes("user_id")
            ? "Token user_id does not match provided userId"
            : err.message || "Failed to initialize chat"
        );
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient
          .disconnectUser()
          .then(() => console.log("User disconnected"))
          .catch((err) => console.error("Failed to disconnect user:", err));
      }
    };
  }, [userId, username, userToken, webinar.id, webinar.title]);

  useEffect(() => {
    if (chatClient && channel) {
      channel.on((event: any) => {
        if (event.type === "open_cta_dialog" && !isHost) {
          setDialogOpen(true);
        }
      });
    }
  }, [chatClient, channel, isHost]);

  const handleCTAButtonClick = async () => {
    if (!channel) {
      console.error("No channel available for CTA event");
      return;
    }
    console.log("CTA button clicked", channel);
    try {
      await channel.sendEvent({
        type: "open_cta_dialog",
      });
    } catch (err) {
      console.error("Failed to send CTA event:", err);
    }
  };
  useEffect(() => {
    call.on("call.rtmp_broadcast_started", () => {
      toast.success("Webinar started successfully");
      router.refresh();
    });
    call.on("call.rtmp_broadcast_failed", () => {
      toast.error("Failed to start stream.");
    });
  }, [call]);

  useEffect(() => {
    call.on("call.recording_started", () => {
      toast.success("Recording has been started.");
    });
    call.on("call.recording_failed", () => {
      toast.error("Recording has been failed.");
    });
  }, [call]);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!chatClient || !channel) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        Loading stream...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <div className="py-2 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-accent-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive animate-pulse"></span>
            </span>
            LIVE
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted/50 px-3 py-1 rounded-full">
            <Users size={16} />
            <span className="text-sm">{viewersCount}</span>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
              showChat
                ? "bg-accent-foreground text-primary-foreground"
                : "bg-accent"
            }`}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 p-2 gap-2 overflow-hidden">
        <div className="flex-1 rounded-lg overflow-hidden border border-border flex flex-col bg-card">
          <div className="flex-1 relative overflow-hidden">
            {hostParticipant ? (
              <div className="w-full h-full">
                <ParticipantView
                  participant={hostParticipant}
                  className="w-full h-full object-cover !max-w-full"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <Users size={40} className="text-muted-foreground" />
                </div>
                <p>Waiting for stream to start...</p>
              </div>
            )}
            {isHost && (
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                Host
              </div>
            )}
          </div>
          <div className="p-2 border-t border-border flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium capitalize">
                {webinar?.title}
              </div>
            </div>
            <div className="flex justify-between items-center gap-x-2">
              {isHost && (
                <div className="flex items-center space-x-1">
                  <Button onClick={handleCTAButtonClick} variant={"outline"}>
                    {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
                      ? "Book a call"
                      : "Buy Now"}
                  </Button>
                </div>
              )}
              {isHost && (
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => setObsDialogOpen(true)}
                    className="mr-2"
                    variant={"outline"}
                  >
                    Get Obs Credentials
                  </Button>
                  <Button
                    onClick={handleEndStream}
                    disabled={loading}
                    variant={"destructive"}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" /> Loading...
                      </>
                    ) : (
                      "End Stream"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {showChat && (
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <div className="w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="py-2 text-primary px-3 border-b border-border font-medium flex items-center justify-between">
                  <span>Chat</span>
                  <span className="text-sx bg-muted px-2 py-0.5 rounded-full">
                    {viewersCount} viewers
                  </span>
                </div>
                <MessageList />
                <div className="p-2 border-t border-border">
                  <MessageInput />
                </div>
              </div>
            </Channel>
          </Chat>
        )}
      </div>
      {dialogOpen && (
        <CTADialogBox
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          webinar={webinar}
          userId={userId}
        />
      )}
      {obsDialogOpen && (
        <ObsDialogBox
          open={obsDialogOpen}
          onOpenChange={setObsDialogOpen}
          rtmpURL={`rtmps://ingress.stream-io-video.com:433/${process.env.NEXT_PUBLIC_STREAM_API_KEY}.livestream.${webinar.id}`}
          streamKey={userToken}
        />
      )}
    </div>
  );
};

export default LiveWebinarView;
