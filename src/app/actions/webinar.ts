"use server";

import { WebinarFormState } from "@/store/useWebinarStore";
import { onAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { WebinarStatusEnum } from "@prisma/client";

function combineDateTime(
  date: Date,
  timeStr: string,
  timeFormat: "AM" | "PM"
): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr || "0", 10);

  if (timeFormat === "PM" && hours < 12) {
    hours += 12;
  } else if (timeFormat === "AM" && hours === 12) {
    hours = 0;
  }
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export const createWebinar = async (formData: WebinarFormState) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) {
      return {
        status: 401,
        message: "Unauthorized",
      };
    }
    if (!user.user.subscription) {
      return {
        status: 402,
        message: "Subscription Required",
      };
    }
    const presenterId = user.user.id;
    if (!formData.basicInfo.webinarName) {
      return { status: 404, message: "Webinar name is required." };
    }
    if (!formData.basicInfo.date) {
      return { status: 404, message: "Webinar date is required." };
    }
    if (!formData.basicInfo.time) {
      return { status: 404, message: "Webinar time is required." };
    }

    const combinedDateTime = combineDateTime(
      formData.basicInfo.date,
      formData.basicInfo.time,
      formData.basicInfo.timeFormat || "AM"
    );
    const now = new Date();
    if (combinedDateTime < now) {
      return {
        status: 400,
        message: "Webinar date and time cannot be in past.",
      };
    }
    const webinar = await prismaClient.webinar.create({
      data: {
        title: formData.basicInfo.webinarName,
        description: formData.basicInfo.description,
        startTime: combinedDateTime,
        tags: formData.cta.tags || [],
        ctaLabel: formData.cta.ctaLabel,
        ctaType: formData.cta.ctaType,
        aiAgentId: formData.cta.aiAgent || null,
        priceId: formData.cta.priceId || null,
        lockChat: formData.additionalInfo.couponEnabled
          ? formData.additionalInfo.couponEnabled
          : undefined,
        couponEnabled: formData.additionalInfo.couponEnabled || false,
        presenterId: presenterId,
      },
    });
    revalidatePath("/");
    return {
      status: 200,
      message: "Webinar created successfully",
      webinarId: webinar.id,
      webinarLink: `/webinar/${webinar.id}`,
    };
  } catch (error) {
    console.error("Error creating webinar", error);
    return {
      status: 500,
      message: "Failed to create webinar. Please try again",
    };
  }
};
export const getWebinarsByPresenterId = async (
  presenterId: string,
  webinarStatus?: string
) => {
  try {
    let webinarStatusFilter: WebinarStatusEnum | undefined;
    switch (webinarStatus) {
      case "upcoming":
        webinarStatusFilter = WebinarStatusEnum.SCHEDULED;
        break;
      case "ended":
        webinarStatusFilter = WebinarStatusEnum.ENDED;
        break;
      default:
        webinarStatusFilter = undefined;
        break;
    }
    const webinar = await prismaClient.webinar.findMany({
      where: {
        presenterId,
        webinarStatus: webinarStatusFilter,
      },
      include: {
        presenter: {
          select: {
            name: true,
            stripeConnectId: true,
            id: true,
          },
        },
      },
    });
    return webinar;
  } catch (error) {
    console.log("Error fetching webinars", error);
    return [];
  }
};

export const getWebinarById = async (webinarId: string) => {
  try {
    if (!webinarId) {
      return {
        status: 401,
        message: "Webinar id required",
      };
    }
    const webinarData = await prismaClient.webinar.findUnique({
      where: {
        id: webinarId,
      },
      include: {
        presenter: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            stripeConnectId: true,
          },
        },
      },
    });
    return webinarData;
  } catch (error) {
    console.log("Internal server error while fetching webinar data", error);
  }
};

export const changeWebinarStatus = async (
  webinarId: string,
  webinarStatus: WebinarStatusEnum
) => {
  try {
    const webinar = await prismaClient.webinar.update({
      where: {
        id: webinarId,
      },
      data: {
        webinarStatus: webinarStatus,
      },
    });
    return {
      status: 200,
      success: true,
      data: webinar,
      message: "Webinar updated successfully",
    };
  } catch (error) {
    console.log("Internal server error", error);
  }
};
