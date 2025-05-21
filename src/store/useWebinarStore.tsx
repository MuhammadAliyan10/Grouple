import {
  validateAdditionInfoField,
  validateBasicInfo,
  validateCTA,
  ValidationErrors,
} from "@/lib/type";
import { CtaTypeEnum } from "@prisma/client";
import { create } from "zustand";

export type WebinarFormState = {
  basicInfo: {
    webinarName?: string;
    description?: string;
    date?: Date;
    time?: string;
    timeFormat: "AM" | "PM";
  };
  cta: {
    ctaLabel?: string;
    tags?: string[];
    ctaType: CtaTypeEnum;
    aiAgent?: string;
    priceId?: string;
  };
  additionalInfo: {
    lockChat?: boolean;
    couponCode?: string;
    couponEnabled?: boolean;
  };
};

const initialState: WebinarFormState = {
  basicInfo: {
    webinarName: "",
    description: "",
    date: undefined,
    time: "",
    timeFormat: "AM",
  },
  cta: {
    ctaLabel: "",
    tags: [],
    ctaType: "BOOK_A_CALL",
    aiAgent: "",
    priceId: "",
  },
  additionalInfo: {
    lockChat: false,
    couponCode: "",
    couponEnabled: false,
  },
};
const initialValidationData = {
  basicInfo: { valid: false, errors: {} },
  cta: { valid: false, errors: {} },
  additionalInfo: { valid: false, errors: {} },
};

type ValidationState = {
  basicInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };
  cta: {
    valid: boolean;
    errors: ValidationErrors;
  };
  additionalInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };
};

type WebinarStore = {
  isModelOpen: boolean;
  isComplete: boolean;
  isSubmitting: boolean;
  formData: WebinarFormState;
  validation: ValidationState;

  updateBasicInfoField: <K extends keyof WebinarFormState["basicInfo"]>(
    field: K,
    value: WebinarFormState["basicInfo"][K]
  ) => void;
  updateCTAField: <K extends keyof WebinarFormState["cta"]>(
    field: K,
    value: WebinarFormState["cta"][K]
  ) => void;
  updateAdditionInfoField: <K extends keyof WebinarFormState["additionalInfo"]>(
    field: K,
    value: WebinarFormState["additionalInfo"][K]
  ) => void;

  validateStep: (stepId: keyof WebinarFormState) => boolean;
  getStepValidationErrors: (stepId: keyof WebinarFormState) => ValidationErrors;
  resetForm: () => void;

  setModelOpen: (isOpen: boolean) => void;
  setComplete: (isComplete: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
};

export const useWebinarStore = create<WebinarStore>((set, get) => ({
  isModelOpen: false,
  isComplete: false,
  isSubmitting: false,
  formData: initialState,
  validation: initialValidationData,

  setModelOpen: (isOpen) => set({ isModelOpen: isOpen }),
  setComplete: (isComplete) => set({ isComplete }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  updateBasicInfoField: (field, value) => {
    set((state) => {
      const newBasicInfo = { ...state.formData.basicInfo, [field]: value };
      const validateResult = validateBasicInfo(newBasicInfo);
      return {
        formData: { ...state.formData, basicInfo: newBasicInfo },
        validation: { ...state.validation, basicInfo: validateResult },
      };
    });
  },
  updateCTAField: (field, value) => {
    set((state) => {
      const newCATField = { ...state.formData.cta, [field]: value };
      const validateResult = validateCTA(newCATField);
      return {
        formData: { ...state.formData, cta: newCATField },
        validation: { ...state.validation, cta: validateResult },
      };
    });
  },
  updateAdditionInfoField: (field, value) => {
    set((state) => {
      const newAdditionInfoField = {
        ...state.formData.additionalInfo,
        [field]: value,
      };
      const validateResult = validateAdditionInfoField(newAdditionInfoField);
      return {
        formData: { ...state.formData, additionalInfo: newAdditionInfoField },
        validation: { ...state.validation, additionalInfo: validateResult },
      };
    });
  },
  validateStep: (stepId: keyof WebinarFormState) => {
    const { formData } = get();
    let validationResult;
    switch (stepId) {
      case "basicInfo":
        validationResult = validateBasicInfo(formData.basicInfo);
        break;
      case "cta":
        validationResult = validateCTA(formData.cta);
        break;
      case "additionalInfo":
        validationResult = validateAdditionInfoField(formData.additionalInfo);
        break;
    }
    set((state) => {
      return {
        validation: { ...state.validation, [stepId]: validationResult },
      };
    });
    return validationResult.valid;
  },
  getStepValidationErrors: (stepId: keyof WebinarFormState) => {
    return get().validation[stepId].errors;
  },
  resetForm: () =>
    set({
      isComplete: false,
      isSubmitting: false,
      formData: initialState,
      validation: initialValidationData,
    }),
}));
