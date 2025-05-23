"use client";
import { getStripeClientSecret } from "@/app/actions/stripe";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@prisma/client";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Loader2, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  user: User;
};

const SubscriptionModel = ({ user }: Props) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      if (!stripe || !elements) {
        return toast.error("Stripe is not loaded");
      }
      const intent = await getStripeClientSecret(user.email || "", user.id);
      if (!intent?.secret) {
        throw new Error("Unable to get client secret");
      }
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intent.secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );
      if (error) {
        throw new Error(error.message);
      }
      console.log("Payment go out successfully", paymentIntent);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Unable to process payment");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-xl flex gap-2 items-center justify-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20">
          <PlusIcon /> Create Webinar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>
          <DialogHeader>Spotlight Subscription</DialogHeader>
        </DialogTitle>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#B4B0AE",
                "::placeholder": {
                  color: "#B4B0AE",
                },
              },
            },
          }}
          className="border-[1px] outline-none rounded-lg p-3 w-full"
        />
        <DialogFooter className="gap-4 items-center">
          <DialogClose
            className="w-full sm:w-auto border border-border rounded-md px-3 py-2"
            disabled={isLoading}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Loading...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModel;
