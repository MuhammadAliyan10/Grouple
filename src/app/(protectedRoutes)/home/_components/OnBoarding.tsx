"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

const OnBoarding = () => {
  const onBoardingSteps = [
    { id: 1, title: "Create a webinar", complete: false, link: "" },
    { id: 2, title: "Get leads", complete: false, link: "" },
    { id: 3, title: "Conversion status", complete: false, link: "" },
  ];
  return (
    <div className="flex flex-col gap-1 items-start justify-start">
      {onBoardingSteps.map((step, index) => (
        <Link key={index} href={step.link} className="flex items-center gap-2">
          <CheckCircle />
          <p className="text-base text-foreground">{step.title}</p>
        </Link>
      ))}
    </div>
  );
};

export default OnBoarding;
