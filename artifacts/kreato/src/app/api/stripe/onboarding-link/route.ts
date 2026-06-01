import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(request: NextRequest) {
  const { accountId } = await request.json();

  if (!accountId) {
    return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.getkreato.com";

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/stripe/refresh?account=${accountId}`,
    return_url: `${origin}/stripe/return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
