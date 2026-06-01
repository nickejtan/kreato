import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(request: NextRequest) {
  const { userId, email } = await request.json();

  if (!userId || !email) {
    return NextResponse.json(
      { error: "Missing userId or email" },
      { status: 400 }
    );
  }

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  // Check if creator already has a Stripe account
  const { data: creator } = await supabase
    .from("creators")
    .select("stripe_account_id")
    .eq("id", userId)
    .single();

  let accountId: string;

  if (creator?.stripe_account_id) {
    accountId = creator.stripe_account_id;
  } else {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    accountId = account.id;

    await supabase
      .from("creators")
      .update({ stripe_account_id: accountId })
      .eq("id", userId);
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
