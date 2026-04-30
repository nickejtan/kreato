import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const NOTIFY_EMAIL = "nicholasetan@gmail.com";

export async function POST(req: NextRequest) {
  let body: { email?: string; instagram?: string; country?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, instagram = "", country = "" } = body;
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanInstagram = instagram.trim().replace(/^@/, "").toLowerCase();

  // Insert into Supabase — try with all fields first, fall back to email-only
  const supabase = await createClient();

  let dbErr: { code?: string; message: string } | null = null;

  // Attempt 1: full insert (requires instagram + country columns to exist)
  const fullInsert = await supabase.from("waitlist").insert({
    email: cleanEmail,
    instagram: cleanInstagram || null,
    country: country || null,
    role: "creator",
  } as never);

  if (fullInsert.error) {
    console.warn("[waitlist] Full insert failed:", fullInsert.error.code, fullInsert.error.message);

    // If the column doesn't exist (42703) or similar schema issue, try email-only
    if (
      fullInsert.error.code === "42703" ||
      fullInsert.error.message?.includes("column") ||
      fullInsert.error.message?.includes("instagram") ||
      fullInsert.error.message?.includes("country")
    ) {
      const fallbackInsert = await supabase.from("waitlist").insert({
        email: cleanEmail,
        role: "creator",
      } as never);
      dbErr = fallbackInsert.error
        ? { code: fallbackInsert.error.code, message: fallbackInsert.error.message }
        : null;
      if (dbErr) {
        console.error("[waitlist] Fallback insert also failed:", dbErr);
      } else {
        console.log("[waitlist] Fallback email-only insert succeeded");
      }
    } else {
      dbErr = { code: fullInsert.error.code, message: fullInsert.error.message };
    }
  }

  // Duplicate email
  if (dbErr?.code === "23505") {
    return NextResponse.json({ error: "duplicate" }, { status: 409 });
  }

  // Hard DB failure (not a schema issue)
  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  // Always send the notification email regardless of whether instagram/country saved
  let emailStatus = "not_attempted";
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.error("[waitlist] RESEND_API_KEY is not set — skipping email");
    emailStatus = "error: RESEND_API_KEY missing";
  } else {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Kreato Waitlist <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          subject: `New waitlist signup: ${cleanInstagram ? `@${cleanInstagram}` : cleanEmail}`,
          html: `
            <h2>New Kreato waitlist signup</h2>
            <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:15px;">
              <tr>
                <td style="color:#6b7280;font-weight:600;">Email</td>
                <td>${cleanEmail}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-weight:600;">Instagram</td>
                <td>${cleanInstagram ? `@${cleanInstagram}` : "(not provided)"}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-weight:600;">Country</td>
                <td>${country || "(not provided)"}</td>
              </tr>
            </table>
          `,
        }),
      });

      const resendData = await resendRes.json();
      console.log("[waitlist] Resend response:", resendRes.status, JSON.stringify(resendData));
      emailStatus = resendRes.ok ? "sent" : `error_${resendRes.status}: ${JSON.stringify(resendData)}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[waitlist] Email fetch exception:", msg);
      emailStatus = `exception: ${msg}`;
    }
  }

  return NextResponse.json({ ok: true, emailStatus });
}
