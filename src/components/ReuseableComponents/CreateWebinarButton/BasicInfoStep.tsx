import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebinarStore } from "@/store/useWebinarStore";
import { cn } from "@/lib/utils";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {};

const BasicInfoStep = (props: Props) => {
  const { formData, resetForm, getStepValidationErrors, updateBasicInfoField } =
    useWebinarStore();
  const errors = getStepValidationErrors("basicInfo");
  const { webinarName, description, date, time, timeFormat } =
    formData.basicInfo;
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateBasicInfoField(name as keyof typeof formData.basicInfo, value);
  };
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate < today) {
        toast.error("Webinar date cannot be past.");
      }
      updateBasicInfoField("date", newDate);
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="webinarName"
          className={errors.webinarName ? "text-red-400" : ""}
        >
          Webinar name <span className="text-red-400">*</span>
        </Label>
        {errors.webinarName && (
          <p className="text-sm text-red-400">{errors.webinarName}</p>
        )}
        <Input
          id="webinarName"
          name="webinarName"
          value={webinarName || ""}
          onChange={handleChange}
          placeholder="Introduction to Mochi"
          className={cn(
            "bg-background/50 border border-input",
            errors.webinarName && "border-red-400 focus-visible:ring-red-400"
          )}
        />
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={errors.description ? "text-red-400" : ""}
        >
          Webinar description <span className="text-red-400">*</span>
        </Label>
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description}</p>
        )}
        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={handleChange}
          placeholder="Introduction to Mochi"
          className={cn(
            "bg-background/50 border border-input",
            errors.description && "border-red-400 focus-visible:ring-red-400"
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.date ? "text-red-400" : ""}>
            Webinar Date <span className="text-red-400">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal !bg-background/50 border border-input",
                  !date && "text-gray-500",
                  errors.date && "border-red-400 focus-visible:ring-red-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 !bg-background/50 border border-input">
              <Calendar
                mode={"single"}
                selected={date}
                onSelect={handleDateChange}
                initialFocus
                className="bg-background"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-sm text-red-400">{errors.date}</p>}
        </div>
        <div className="space-y-2">
          <Label className={errors.time ? "text-red-400" : ""}>
            Webinar time <span className="text-red-400">*</span>
          </Label>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
