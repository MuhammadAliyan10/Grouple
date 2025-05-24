"use server";

import { prismaClient } from "@/lib/prismaClient";
import { AttendanceData } from "@/lib/type";
import { AttendedTypeEnum, CtaTypeEnum } from "@prisma/client";
import { count } from "console";
import { revalidatePath } from "next/cache";

export const getWebinarAttendance = async (
  webinarId: string,
  options: {
    includeUsers?: boolean;
    userLimit?: number;
  } = { includeUsers: true, userLimit: 100 }
) => {
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: {
        id: webinarId,
      },
      select: {
        id: true,
        ctaType: true,
        tags: true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
    if (!webinar) {
      return {
        error: "Webinar not found",
        success: false,
        status: 404,
      };
    }
    const attendancesCount = await prismaClient.attendance.groupBy({
      by: ["attendedType"],
      where: {
        webinarId: webinarId,
      },
      _count: {
        attendedType: true,
      },
    });
    const result: Record<AttendedTypeEnum, AttendanceData> = {} as Record<
      AttendedTypeEnum,
      AttendanceData
    >;
    for (const type of Object.values(AttendedTypeEnum)) {
      if (
        type === AttendedTypeEnum.ADDED_TO_CART &&
        webinar.ctaType === "BOOK_A_CALL"
      ) {
        continue;
      }
      if (
        type === AttendedTypeEnum.BREAKOUT_ROOM &&
        webinar.ctaType !== "BOOK_A_CALL"
      ) {
        continue;
      }
      const contItem = attendancesCount.find((item) => {
        if (
          webinar.ctaType === "BOOK_A_CALL" &&
          type === AttendedTypeEnum.BREAKOUT_ROOM &&
          item.attendedType === AttendedTypeEnum.ADDED_TO_CART
        ) {
          return true;
        }
        return item.attendedType == type;
      });
      result[type] = {
        count: contItem ? contItem._count.attendedType : 0,
        user: [],
      };
    }
    if (options.includeUsers) {
      for (const type of Object.values(AttendedTypeEnum)) {
        if (
          (type == AttendedTypeEnum.ADDED_TO_CART &&
            webinar.ctaType === "BOOK_A_CALL") ||
          (type == AttendedTypeEnum.BREAKOUT_ROOM &&
            webinar.ctaType !== "BOOK_A_CALL")
        ) {
          continue;
        }
        const queryType =
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
          type === AttendedTypeEnum.BREAKOUT_ROOM
            ? AttendedTypeEnum.ADDED_TO_CART
            : type;
        if (result[type].count > 0) {
          const attendances = await prismaClient.attendance.findMany({
            where: {
              webinarId: webinarId,
              attendedType: queryType,
            },
            include: {
              user: true,
            },
            take: options.userLimit,
            orderBy: {
              joinedAt: "desc",
            },
          });
          result[type].user = attendances.map((attendance) => ({
            id: attendance.user.id,
            name: attendance.user.name,
            email: attendance.user.email,
            attendedAt: attendance.joinedAt,
            stripConnectId: null,
            callStatus: attendance.user.callStatus,
          }));
        }
      }
    }
    // revalidatePath(`/webinars/${webinarId}/pipeline`);
    return {
      success: true,
      data: result,
      ctaType: webinar.ctaType,
      webinarTags: webinar.tags || [],
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong",
    };
  }
};

export const registerAttendee = async (
  webinarId: string,
  email: string,
  name: string
) => {
  try {
    if (!webinarId || !email) {
      return {
        success: false,
        status: 400,
        message: "Missing required parameters",
      };
    }
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
    });
    if (!webinar) {
      return {
        success: false,
        status: 404,
        message: "Webinar not found",
      };
    }
    let attendee = await prismaClient.attendee.findUnique({
      where: { email },
    });
    if (!attendee) {
      attendee = await prismaClient.attendee.create({
        data: { email, name },
      });
    }
    const existingAttendee = await prismaClient.attendance.findFirst({
      where: {
        attendeeId: attendee.id,
        webinarId: webinarId,
      },
      include: {
        user: true,
      },
    });
    if (existingAttendee) {
      return {
        success: true,
        status: 200,
        data: existingAttendee,
        message: "You are already registered for webinar.",
      };
    }
    const attendance = await prismaClient.attendance.create({
      data: {
        attendedType: AttendedTypeEnum.REGISTERED,
        attendeeId: attendee.id,
        webinarId: webinarId,
      },
      include: {
        user: true,
      },
    });
    revalidatePath(`/${webinarId}`);
    return {
      success: true,
      status: 200,
      data: attendance,
      message: "Successful registered..",
    };
  } catch (error) {
    console.log("Internal server error", error);
    return {
      success: false,
      status: 400,
      message: "Internal server error",
    };
  }
};
