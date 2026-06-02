import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });

  const { paymentLinkId } = await request.json();

  if (!paymentLinkId) {
    return NextResponse.json({ error: "Missing paymentLinkId" }, { status: 400 });
  }

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data: link, error: linkError } = await supabase
    .from("payment_links")
    .select("*")
    .eq("id", paymentLinkId)
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
  }

  if (link.status === "paid") {
    return NextResponse.json({ error: "This payment link has already been paid" }, { status: 400 });
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("stripe_account_id")
    .eq("id", link.created_by)
    .single();

  if (!creator?.stripe_account_id) {
    return NextResponse.json({ error: "Freelancer has not completed payment setup" }, { status: 400 });
  }

  // Calculate charge amount (deposit or full)
  const chargeAmount =
    link.deposit_percentage
      ? link.amount * link.deposit_percentage / 100
      : link.amount;

  const chargeAmountCents = Math.round(chargeAmount * 100);

  // Platform fee: 5% + RM 1.00 (100 sen)
  const feeAmountCents = Math.round(chargeAmountCents * 0.05) + 100;

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.getkreato.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "myr",
          product_data: {
            name: link.project_name,
            description: link.description ?? undefined,
          },
          unit_amount: chargeAmountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: link.client_email,
    payment_intent_data: {
      application_fee_amount: feeAmountCents,
      transfer_data: {
        destination: creator.stripe_account_id,
      },
    },
    success_url: `${origin}/pay/${paymentLinkId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pay/${paymentLinkId}`,
    metadata: {
      payment_link_id: paymentLinkId,
      created_by: link.created_by,
    },
  });

  return NextResponse.json({ url: session.url });
}
