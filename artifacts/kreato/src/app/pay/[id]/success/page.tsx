import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import Link from "next/link";
import { generateInvoice } from "@/lib/generateInvoice";

export const dynamic = "force-dynamic";

function fmt(amount: number) {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function sendEmail(payload: object) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify(payload),
  });
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

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["payment_intent"],
      });

      if (session.payment_status === "paid") {
        const { data: link } = await supabase
          .from("payment_links")
          .select("*")
          .eq("id", id)
          .single();

        if (link) {
          projectName = link.project_name;
          clientEmail = link.client_email;
          amountPaid = link.deposit_percentage
            ? link.amount * link.deposit_percentage / 100
            : link.amount;

          const feeAmount = Math.round(amountPaid * 100 * 0.05) / 100 + 1;
          const netAmount = amountPaid - feeAmount;

          // Idempotency check
          const { data: existing } = await supabase
            .from("transactions")
            .select("id")
            .eq("stripe_session_id", session_id)
            .maybeSingle();

          if (!existing) {
            // ── 1. Record transaction ──
            const { data: txData } = await supabase
              .from("transactions")
              .insert({
                payment_link_id: id,
                stripe_session_id: session_id,
                stripe_payment_intent_id:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : (session.payment_intent?.id ?? null),
                amount: amountPaid,
                fee: feeAmount,
                net: netAmount,
                client_name: link.client_name,
                client_email: link.client_email,
                project_name: link.project_name,
                created_by: link.created_by,
              })
              .select("id")
              .single();

            // ── 2. Update payment link status ──
            await supabase
              .from("payment_links")
              .update({ status: "paid" })
              .eq("id", id);

            // ── 3. PDF + email (non-critical — errors logged but don't break page) ──
            if (txData?.id) {
              try {
                // Get creator info
                let freelancerName = "Freelancer";
                let freelancerEmail = "";

                try {
                  const { data: creatorData } = await supabase
                    .from("creators")
                    .select("full_name")
                    .eq("id", link.created_by)
                    .single();
                  if (creatorData?.full_name) freelancerName = creatorData.full_name;

                  // Try admin API for email + business name (requires service role key)
                  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                    const { data: adminData } = await supabase.auth.admin.getUserById(link.created_by);
                    if (adminData?.user?.email) freelancerEmail = adminData.user.email;
                    if (adminData?.user?.user_metadata?.business_name) {
                      freelancerName = adminData.user.user_metadata.business_name;
                    } else if (adminData?.user?.user_metadata?.full_name) {
                      freelancerName = adminData.user.user_metadata.full_name;
                    }
                  }
                } catch {
                  // Fall back to defaults
                }

                const today = new Date().toISOString().split("T")[0];

                // ── Generate PDF ──
                const pdfBytes = await generateInvoice({
                  transactionId: txData.id,
                  paymentDate: fmtDateLong(today),
                  dueDate: fmtDateLong(link.due_date),
                  freelancerName,
                  freelancerEmail,
                  clientName: link.client_name,
                  clientEmail: link.client_email,
                  projectName: link.project_name,
                  description: link.description ?? null,
                  grossAmount: amountPaid,
                  feeAmount,
                  netAmount,
                });

                const invoiceNumber = `INV-${txData.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
                const pdfFilename = `invoice-${invoiceNumber}.pdf`;
                const base64Pdf = Buffer.from(pdfBytes).toString("base64");

                // ── Upload to Supabase Storage ──
                try {
                  await supabase.storage
                    .from("invoices")
                    .upload(`${txData.id}.pdf`, pdfBytes, {
                      contentType: "application/pdf",
                      upsert: false,
                    });
                } catch {
                  // Storage might not be set up yet — continue
                }

                const attachment = {
                  filename: pdfFilename,
                  content: base64Pdf,
                };

                // ── Email 1: Freelancer ──
                if (freelancerEmail) {
                  await sendEmail({
                    from: "Kreato <onboarding@resend.dev>",
                    to: [freelancerEmail],
                    subject: `Payment received — ${link.project_name}`,
                    html: `
                      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
                        <div style="background:#7c3aed;padding:28px 32px;border-radius:12px 12px 0 0;">
                          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">KREATO</span>
                        </div>
                        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 12px 12px;">
                          <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Payment received 🎉</h2>
                          <p style="color:#6b7280;margin:0 0 24px;font-size:15px;">
                            <strong>${link.client_name}</strong> has paid for <strong>${link.project_name}</strong>.
                          </p>

                          <div style="background:#f5f3ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                            <p style="margin:0 0 4px;font-size:11px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Amount received</p>
                            <p style="margin:0;font-size:28px;font-weight:700;color:#7c3aed;">${fmt(amountPaid)}</p>
                          </div>

                          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
                            <tr>
                              <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Client</td>
                              <td style="padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6;">${link.client_name}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Project</td>
                              <td style="padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6;">${link.project_name}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Gross</td>
                              <td style="padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6;">${fmt(amountPaid)}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Kreato fee</td>
                              <td style="padding:8px 0;text-align:right;color:#6b7280;border-bottom:1px solid #f3f4f6;">−${fmt(feeAmount)}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;font-weight:700;">Net received</td>
                              <td style="padding:8px 0;text-align:right;font-weight:700;color:#7c3aed;">${fmt(netAmount)}</td>
                            </tr>
                          </table>

                          <p style="font-size:13px;color:#9ca3af;margin:0;">The invoice PDF is attached to this email.</p>
                        </div>
                        <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Powered by Kreato · Secured by Stripe</p>
                      </div>
                    `,
                    attachments: [attachment],
                  });
                }

                // ── Email 2: Client ──
                await sendEmail({
                  from: "Kreato <onboarding@resend.dev>",
                  to: [link.client_email],
                  subject: `Your receipt — ${link.project_name}`,
                  html: `
                    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
                      <div style="background:#7c3aed;padding:28px 32px;border-radius:12px 12px 0 0;">
                        <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">KREATO</span>
                      </div>
                      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 12px 12px;">
                        <div style="background:#f0fdf4;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
                          <span style="font-size:24px;">✅</span>
                          <div>
                            <p style="margin:0;font-weight:700;font-size:16px;color:#166534;">Payment successful</p>
                            <p style="margin:2px 0 0;font-size:13px;color:#16a34a;">Invoice ${invoiceNumber}</p>
                          </div>
                        </div>

                        <p style="color:#374151;margin:0 0 24px;font-size:15px;">
                          Hi <strong>${link.client_name}</strong>, your payment to <strong>${freelancerName}</strong> has been received.
                        </p>

                        <div style="background:#f5f3ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Amount paid</p>
                          <p style="margin:0;font-size:28px;font-weight:700;color:#7c3aed;">${fmt(amountPaid)}</p>
                        </div>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Project</td>
                            <td style="padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6;">${link.project_name}</td>
                          </tr>
                          ${link.description ? `
                          <tr>
                            <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Description</td>
                            <td style="padding:8px 0;text-align:right;color:#374151;border-bottom:1px solid #f3f4f6;">${link.description}</td>
                          </tr>` : ""}
                          <tr>
                            <td style="padding:8px 0;color:#6b7280;">Date</td>
                            <td style="padding:8px 0;text-align:right;color:#374151;">${fmtDateShort(today)}</td>
                          </tr>
                        </table>

                        <p style="font-size:13px;color:#9ca3af;margin:0;">Your receipt (PDF) is attached to this email. Keep it for your records.</p>
                      </div>
                      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Powered by Kreato · Secured by Stripe</p>
                    </div>
                  `,
                  attachments: [attachment],
                });
              } catch (err) {
                console.error("[success] PDF/email processing error:", err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("[success] Stripe verification error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-base">K</span>
        </div>
        <span className="font-bold text-gray-900 text-xl tracking-tight">Kreato</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>

        {projectName && (
          <p className="text-gray-500 text-sm mb-6">{projectName}</p>
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
