// lib/stripe/stripe-client.ts
import { loadStripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import type { Stripe } from "@stripe/stripe-js";

interface StripeElementsHook {
  stripePromise: Promise<Stripe | null>;
}

export const useStripeElements = (
  connectedStripeAccount?: string
): StripeElementsHook => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error(
      "Stripe publishable key is missing. Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set."
    );
  }

  const stripePromise = useMemo(() => {
    return loadStripe(publishableKey, {
      ...(connectedStripeAccount && { stripeAccount: connectedStripeAccount }),
    });
  }, [publishableKey, connectedStripeAccount]);

  return { stripePromise };
};
