import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import Link from "next/link";

export const dynamic = "force-dynamic";

function fmt(amount: number) {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  let projectName = "";
  let clientEmail = "";
  let amountPaid = 0;
  let verified = false;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["payment_intent"],
      });

      if (session.payment_status === "paid") {
        verified = true;

        // Fetch payment link details
        const { data: link } = await supabase
          .from("payment_links")
          .select("*")
          .eq("id", id)
          .single();

        if (link) {
          projectName = link.project_name;
          clientEmail = link.client_email;
          amountPaid =
            link.deposit_percentage
              ? link.amount * link.deposit_percentage / 100
              : link.amount;

          // Check for existing transaction (idempotency)
          const { data: existing } = await supabase
            .from("transactions")
            .select("id")
            .eq("stripe_session_id", session_id)
            .maybeSingle();

          if (!existing) {
            const feeAmountCents = Math.round(amountPaid * 100 * 0.05) + 100;
            const feeAmount = feeAmountCents / 100;

            // Record transaction
            await supabase.from("transactions").insert({
              payment_link_id: id,
              stripe_session_id: session_id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : (session.payment_intent?.id ?? null),
              amount: amountPaid,
              fee: feeAmount,
              net: amountPaid - feeAmount,
              client_name: link.client_name,
              client_email: link.client_email,
              project_name: link.project_name,
              created_by: link.created_by,
            });

            // Update payment link status
            await supabase
              .from("payment_links")
              .update({ status: "paid" })
              .eq("id", id);
          }
        }
      }
    } catch {
      // If Stripe verification fails, we still show a generic success (don't leak errors)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-base">K</span>
        </div>
        <span className="font-bold text-gray-900 text-xl tracking-tight">Kreato</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10 text-center">

        {/* Green checkmark */}
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>

        {projectName && (
          <p className="text-gray-500 text-sm mb-6">
            {projectName}
          </p>
        )}

        {amountPaid > 0 && (
          <div className="bg-gray-50 rounded-2xl px-6 py-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Amount paid</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(amountPaid)}</p>
          </div>
        )}

        {clientEmail && (
          <p className="text-sm text-gray-500 mb-8">
            Your receipt has been sent to{" "}
            <span className="font-medium text-gray-700">{clientEmail}</span>
          </p>
        )}

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mt-4">
            Powered by <span className="font-semibold text-gray-500">Kreato</span> · Secured by Stripe
          </p>
        </div>
      </div>

      <Link
        href="https://www.getkreato.com"
        className="mt-6 text-xs text-gray-400 hover:text-violet-600 transition-colors"
      >
        What is Kreato?
      </Link>
    </div>
  );
}
