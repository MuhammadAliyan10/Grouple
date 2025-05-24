import { updateSubscription } from "@/app/actions/stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SUBSCRIPTION_EVENTS = new Set([
  "invoice.paid",
  "invoice.finalized",
  "invoice.created",
  "invoice.session.completed",
  "invoice.payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);
const getStripeEvent = async (
  body: string,
  signature: string | null
): Promise<Stripe.Event> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    throw new Error("Stripe signature and webhook secret missing.");
  }
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
};
export async function POST(request: NextRequest) {
  console.log("Received webhook from Stripe");
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  try {
    const stripeEvent = await getStripeEvent(body, signature);
    if (!STRIPE_SUBSCRIPTION_EVENTS.has(stripeEvent.type)) {
      console.log(`Unhandled event type: ${stripeEvent.type}`);
      return NextResponse.json(
        { message: "Event type not handled" },
        { status: 200 }
      );
    }
    const event = stripeEvent.data.object as Stripe.Subscription;
    const metadata = event.metadata;
    if (
      metadata.connectAccountPayments ||
      metadata.connectAccountSubscriptions
    ) {
      console.log("Skipping connected account");
      return NextResponse.json(
        { message: "Skipping connected account event." },
        { status: 200 }
      );
    }
    switch (stripeEvent.type) {
      case "customer.subscription.created":

      case "customer.subscription.deleted":

      case "customer.subscription.updated":
        await updateSubscription(event);
        console.log("Created webhook from ", event);
        return NextResponse.json({ received: true }, { status: 200 });
      default:
        console.log("Unhandled webhook event ", event);
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error: any) {
    console.log("Webhook processing error");
    return new NextResponse(`Webhook processing error: ${error.message}`, {
      status: error.statusCode || 500,
    });
  }
}
