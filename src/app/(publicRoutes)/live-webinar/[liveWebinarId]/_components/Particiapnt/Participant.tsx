import { getStreamToken } from "@/app/actions/stream";
import { Button } from "@/components/ui/button";
import { WebinarWithPresenter } from "@/lib/type";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  type User,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Stream from "stream";
import LiveWebinarView from "../Common/LiveWebinarView";

type Props = {
  apiKey: string;
  webinar: WebinarWithPresenter;
  callId: string;
};

const Participant = ({ apiKey, webinar, callId }: Props) => {
  const { attendee } = useAttendeeStore();
  const [showChat, setShowChat] = useState<boolean>(false);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "failed" | "reconnecting" | "connected"
  >("connecting");
  const clientInitialized = useRef<boolean>(false);
  useEffect(() => {
    if (clientInitialized.current) return;
    const initClient = async () => {
      try {
        setConnectionStatus("connecting");
        const user: User = {
          id: attendee?.id || "guest",
          name: attendee?.name || "Guest",
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${
            attendee?.name || "Guest"
          }`,
        };
        const userToken = await getStreamToken(attendee);
        setToken(userToken);

        const streamClient = new StreamVideoClient({
          apiKey,
          user,
          token: userToken,
        });
        streamClient.on("connection.changed", (event) => {
          if (event.online) {
            setConnectionStatus("connected");
          } else {
            setConnectionStatus("reconnecting");
          }
        });
        await streamClient.connectUser(user, userToken);
        const streamCall = streamClient.call("livestream", callId);
        await streamCall.join({ create: true });
        setClient(streamClient);
        setCall(streamCall);
        setConnectionStatus("connected");
        clientInitialized.current = true;
      } catch (error) {
        console.log("Error while initializing client or joining the call");
        setConnectionStatus("failed");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to connect webinar."
        );
      }
    };
    initClient();
    return () => {
      const currentCall = call;
      const currentClient = client;
      if (currentCall && currentClient) {
        currentCall
          .leave()
          .then(() => {
            console.log("Left the call");
            currentClient.disconnectUser();
            clientInitialized.current = false;
          })
          .catch((e) => console.log("Error Call Leaving", e));
      }
    };
  }, [apiKey, callId, attendee, call, client, webinar.id]);
  if (!attendee) {
    return (
      <div className="flex items-center justify-center bg-background h-screen text-foreground">
        <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
          <h2 className="text-2xl font-bold mb-4">
            Please register to join the webinar
          </h2>
          <p className="text-muted-foreground mb-6">
            Registration is required to participate in this webinar.
          </p>
          <Button
            className="bg-accent-primary hover:bg-accent-primary/90 text-accent-foreground"
            onClick={() => window.location.reload()}
          >
            Register Now
          </Button>
        </div>
      </div>
    );
  }
  if (!client || !call || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-white">
        <motion.div
          className="text-center max-w-md p-8 rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {connectionStatus === "connecting" && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-blue-400" />
                  <motion.div
                    className="absolute inset-0 bg-blue-400/20 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                <p className="mt-4 text-lg font-medium">Joining Webinar...</p>
                <p className="mt-2 text-sm text-gray-400">
                  Please wait while we connect you{" "}
                  <span className="text-red-400">{webinar.title}</span>
                </p>
              </motion.div>
            )}

            {connectionStatus === "reconnecting" && (
              <motion.div
                key="reconnecting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="h-8 w-8 border-4 border-t-transparent border-blue-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <p className="mt-4 text-lg font-medium">Reconnecting...</p>
                <p className="mt-2 text-sm text-gray-400">
                  Attempting to restore connection
                </p>
              </motion.div>
            )}

            {connectionStatus === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="h-8 w-8 text-red-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 3, ease: "easeInOut" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <p className="mt-4 text-lg font-medium">Connection Failed</p>
                <p className="mt-2 text-sm text-gray-400">
                  Please check your network and try again
                </p>
                <motion.button
                  className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConnectionStatus("reconnecting")}
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <LiveWebinarView
          showChat={showChat}
          setShowChat={setShowChat}
          webinar={webinar}
          isHost={false}
          username={attendee.name}
          userId={attendee.id}
          userToken={token}
          call={call}
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default Participant;
