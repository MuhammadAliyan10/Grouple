"use client";
import {
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWebinarStore } from "@/store/useWebinarStore";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import MultiStepForm from "./MultiStepForm";
import BasicInfoStep from "./BasicInfoStep";
import CTAStep from "./CTAStep";
import AdditionalInfoStep from "./AdditionalInfoStep";
import Stripe from "stripe";
import SuccessStep from "./SuccessStep";

type Props = {
  stripeProducts: Stripe.Product[] | [];
};

const CreateWebinarButton = ({ stripeProducts }: Props) => {
  const { isModelOpen, setModelOpen, isComplete, setComplete, resetForm } =
    useWebinarStore();
  const [webinarLink, setWebinarLink] = useState<string>("");
  const handleCreateNew = () => {
    resetForm();
  };
  const steps = [
    {
      id: "basicInfo",
      title: "Basic Information",
      description: "Enter the basic information for your webinar.",
      component: <BasicInfoStep />,
    },
    {
      id: "cta",
      title: "CTA",
      description:
        "Please provide the end-point for your customers though your webinar.",
      component: <CTAStep assistants={[]} stripeProducts={stripeProducts} />,
    },
    {
      id: "additionalInfo",
      title: "Additional Information",
      description:
        "Please fill out the additional information for your webinar if necessary.",
      component: <AdditionalInfoStep />,
    },
  ];
  const handleComplete = (id: string) => {
    setComplete(true);
    setWebinarLink(`${process.env.NEXT_PUBLIC_BASE_URL}/live-webinar/${id}`);
  };
  return (
    <Dialog open={isModelOpen} onOpenChange={setModelOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
          onClick={() => setModelOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
          Create Webinar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-none">
        {isComplete ? (
          <div className="bg-muted text-primary rounded-lg overflow-hidden">
            <DialogTitle className="sr-only">Webinar Created</DialogTitle>
            <SuccessStep
              webinarLink={webinarLink}
              onCreateNew={handleCreateNew}
              onClose={() => setModelOpen(false)}
            />
          </div>
        ) : (
          <>
            <DialogTitle className="sr-only">Create Webinar</DialogTitle>
            <MultiStepForm steps={steps} onComplete={handleComplete} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebinarButton;
