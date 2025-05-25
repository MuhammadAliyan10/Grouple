"use server";

import { getStreamClient } from "@/lib/stream/streamClient";
import { Attendee } from "@prisma/client";
import { UserRequest } from "@stream-io/video-react-sdk";

export const getStreamToken = async (attendee: Attendee | null) => {
  try {
    const newUser: UserRequest = {
      id: attendee?.id || "guest",
      name: attendee?.name || "Guest",
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${
        attendee?.name || "Guest"
      }`,
    };
    await getStreamClient.upsertUsers([newUser]);
    const validity = 60 * 60 * 60;
    const token = getStreamClient.generateUserToken({
      user_id: attendee?.id || "guest",
      validity_in_seconds: validity,
    });
    return token;
  } catch (error) {
    console.log("Internal server error", error);
    throw new Error("Failed to create token");
  }
};
