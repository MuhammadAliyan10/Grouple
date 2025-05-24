import { Attendee, CtaTypeEnum } from "@prisma/client";

export type ValidationErrors = Record<string, string>;
export type ValidationResult = {
  valid: boolean;
  errors: ValidationErrors;
};
export const validateBasicInfo = (data: {
  webinarName?: string;
  description?: string;
  date?: Date;
  time?: string;
  timeFormat: "AM" | "PM";
}): ValidationResult => {
  const errors: ValidationErrors = {};
  if (!data.webinarName?.trim()) {
    errors.webinarName = "Webinar name is required";
  }
  if (!data.description?.trim()) {
    errors.description = "Description is required";
  }
  if (!data.date) {
    errors.date = "Date is required";
  }
  if (!data.time?.trim()) {
    errors.time = "Time is required";
  } else {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
    if (!timeRegex.test(data.time)) {
      errors.time = "Invalid time format. Must be format at HH:MM";
    }
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCTA = (data: {
  ctaLabel?: string;
  tags?: string[];
  ctaType: string;
  aiAgent?: string;
  priceId?: string;
}): ValidationResult => {
  const errors: ValidationErrors = {};
  if (!data.ctaLabel?.trim()) {
    errors.date = "CTA label is required";
  }
  if (!data.ctaLabel?.trim()) {
    errors.date = "CTA label is required";
  }
  if (!data.ctaType?.trim()) {
    errors.date = "Please enter the CTA type.";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAdditionInfoField = (data: {
  lockChat?: boolean;
  couponCode?: string;
  couponEnabled?: boolean;
}): ValidationResult => {
  const errors: ValidationErrors = {};
  if (data.couponEnabled && !data.couponCode?.trim()) {
    errors.couponCode = "Coupon code is required";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export type AttendanceData = {
  count: number;
  user: Attendee[];
};

export const subscriptionPriceId = "price_1RSAdvDAvjzw3ABZXdcMVw72";
