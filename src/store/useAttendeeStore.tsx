import {
  validateAdditionInfoField,
  validateBasicInfo,
  validateCTA,
  ValidationErrors,
} from "@/lib/type";
import { Attendee, CtaTypeEnum } from "@prisma/client";
import { create, createStore } from "zustand";
import { persist } from "zustand/middleware";

type AttendeeStore = {
  attendee: Attendee | null;
  setAttendee: (attendee: Attendee) => void;
  clearAttendee: () => void;
};

export const useAttendeeStore = create<AttendeeStore>()(
  persist(
    (set) => ({
      attendee: null,
      setAttendee: (attendee) => set({ attendee }),
      clearAttendee: () => set({ attendee: null }),
    }),
    {
      name: "attendee-storage",
    }
  )
);
