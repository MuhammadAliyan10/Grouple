// StripeComponents/Element.tsx
"use client";
import { Elements } from "@stripe/react-stripe-js";
import { useStripeElements } from "@/lib/stripe/stripe-client";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const StripeElements = ({ children }: Props) => {
  const { stripePromise } = useStripeElements(); // Directly get the promise
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeElements;
