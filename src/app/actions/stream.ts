"use server";

import { prismaClient } from "@/lib/prismaClient";
import { getStreamClient } from "@/lib/stream/streamClient";
import { Attendee, Webinar } from "@prisma/client";
import { UserRequest } from "@stream-io/node-sdk";

export const getStreamToken = async (attendee: Attendee | null) => {
  try {
    const newUser: UserRequest = {
      id: attendee?.id || "guest",
      role: "user",
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

export const getTokenForHost = async (
  userId: string,
  username: string,
  profilePic: string
) => {
  try {
    const newUser: UserRequest = {
      id: userId,
      role: "user",
      name: username || "Guest",
      image:
        profilePic ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    };
    await getStreamClient.upsertUsers([newUser]);
    const validity = 60 * 60 * 60;
    const token = getStreamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    });
    return token;
  } catch (error) {
    console.log("Internal server error", error);
    throw new Error("Failed to generate streamio host token.");
  }
};

export const createAndStartStream = async (webinar: Webinar) => {
  try {
    const checkWebinar = await prismaClient.webinar.findMany({
      where: {
        presenterId: webinar.presenterId,
        webinarStatus: "LIVE",
      },
    });
    if (checkWebinar.length > 0) {
      throw new Error("You already have a live stream running.");
    }
    const call = getStreamClient.video.call("livestream", webinar.id);
    await call.getOrCreate({
      data: {
        created_by_id: webinar.presenterId,
        members: [{ user_id: webinar.presenterId, role: "host" }],
      },
    });
    console.log("Stream created and started successfully.");
  } catch (error) {
    console.log("Internal server error", error);
    throw new Error("Error while creating or starting stream.");
  }
};

//TODO:Make a call to get the recording
