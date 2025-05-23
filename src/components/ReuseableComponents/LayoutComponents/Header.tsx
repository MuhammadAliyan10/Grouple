"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";
import PurpleIcon from "../PurpleIcon";
import CreateWebinarButton from "../CreateWebinarButton";
import Stripe from "stripe";
import StripeElements from "../StripeComponents/Element";
import SubscriptionModel from "../SubscriptionModel";

type Props = { user: User; stripeProducts: Stripe.Product[] | [] };

const Header = ({ user, stripeProducts }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="w-full mb-10 px-4 pt-10 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 bg-background">
      {pathname.includes("pipeline") ? (
        <Button
          className="bg-primary/10 border border-border rounded-x1"
          variant={"outline"}
          onClick={() => router.push("/webinar")}
        >
          <ArrowLeft /> Back to Webinars
        </Button>
      ) : (
        <div className="px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize">
          {pathname.split("/")[1]}
        </div>
      )}
      <div className="flex gap-6 items-center flex-wrap">
        <PurpleIcon>
          <Zap />
        </PurpleIcon>
        {user.subscription ? (
          <CreateWebinarButton stripeProducts={stripeProducts} />
        ) : (
          <StripeElements>
            <SubscriptionModel user={user} />
          </StripeElements>
        )}
      </div>
    </div>
  );
};

export default Header;
