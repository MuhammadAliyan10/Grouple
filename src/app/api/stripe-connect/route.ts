import { prismaClient } from "@/lib/prismaClient";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
      console.log("Missing params", { code, state });
      return NextResponse.redirect(
        new URL(
          `/settings?success=false&message=Missing+required+parameter`,
          request.url
        )
      );
    }
    try {
      const res = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });
      if (!res.stripe_user_id) {
        throw new Error("Failed to retrieve stripe user id.");
      }
      await prismaClient.user.update({
        where: {
          id: state,
        },
        data: {
          stripeConnectId: res.stripe_user_id,
        },
      });
      console.log("Successfully connect stripe account.");
      return NextResponse.redirect(
        new URL(
          `/settings?success=true&message=Stripe+account+connected+successfully`,
          request.url
        )
      );
    } catch (stripeError) {
      console.log("Stripe connection error.", stripeError);
      return NextResponse.redirect(
        new URL(
          `/settings?success=false&message=${encodeURIComponent(
            (stripeError as Error).message
          )}`,
          request.url
        )
      );
    }
  } catch (error) {
    console.log("Internal server error", error);
    return NextResponse.redirect(
      new URL(
        `/settings?success=false&message=Internal+server+error`,
        request.url
      )
    );
  }
}
