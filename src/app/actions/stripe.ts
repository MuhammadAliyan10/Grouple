"use server";

import { stripe } from "@/lib/stripe";
import { onAuthenticateUser } from "./auth";
import Stripe from "stripe";
import { prismaClient } from "@/lib/prismaClient";
import { subscriptionPriceId } from "@/lib/type";
import { changeAttendanceType } from "./attendance";

export const getAllProductsFromStripe = async () => {
  try {
    const currentUser = await onAuthenticateUser();
    if (!currentUser.user) {
      return { status: 401, message: "Unauthorized", success: false };
    }
    if (!currentUser.user.stripeConnectId) {
      return {
        status: 401,
        message: "User not connect to stripe",
        success: false,
      };
    }
    const products = await stripe.products.list(
      {},
      { stripeAccount: currentUser.user.stripeConnectId }
    );
    return { status: 200, products: products.data, success: true };
  } catch (error) {
    console.log(error);
    return { status: 401, message: "Internal server error", success: false };
  }
};

export const getStripeClientSecret = async (email: string, userId: string) => {
  try {
    if (!email || !userId) {
      return { status: 401, message: "Uncompleted data.", success: false };
    }
    const currentUser = await onAuthenticateUser();
    if (!currentUser.user) {
      return { status: 401, message: "Unauthorized", success: false };
    }
    let customer: Stripe.Customer;
    const existingCustomer = await stripe.customers.list({ email: email });
    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
    }
    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeCustomerId: customer.id,
      },
    });
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: subscriptionPriceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: userId,
      },
    });
    const paymentIntent = (subscription.latest_invoice as Stripe.Invoice)
      .payment_intent as Stripe.PaymentIntent;
    return {
      status: 200,
      secret: paymentIntent.client_secret,
      customerId: customer.id,
    };
  } catch (error) {
    console.log("Internal server error", error);
  }
};

export const updateSubscription = async (subscription: Stripe.Subscription) => {
  try {
    const userId = subscription.metadata.userId;
    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        subscription: subscription.status == "active" ? true : false,
      },
    });
  } catch (error) {
    console.log("Internal Server error while updating subscription", error);
  }
};

export const createCheckoutLink = async (
  priceId: string,
  stripeId: string,
  userId: string,
  webinarId: string,
  bookCall: boolean = false
) => {
  try {
    const session = await stripe.checkout.sessions.create(
      {
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        metadata: {
          attendeeId: userId,
          webinarId: webinarId,
        },
      },
      { stripeAccount: stripeId }
    );
    if (bookCall) {
      await changeAttendanceType(userId, webinarId, "ADDED_TO_CART");
    }
    return {
      sessionUrl: session.url,
      status: 200,
      success: true,
    };
  } catch (error) {
    console.log("Internal server error", error);
    return {
      error: error,
      status: 400,
      success: false,
    };
  }
};
