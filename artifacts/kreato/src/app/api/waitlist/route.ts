import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = "nicholasetan@gmail.com";

export async function POST(req: NextRequest) {
  let body: { email: string; instagram: string; country: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, instagram, country } = body;
  if (!email || !instagram || !country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Insert into Supabase
  const supabase = await createClient();
  const { error: dbErr } = (await supabase.from("waitlist").insert({
    email: email.trim().toLowerCase(),
    instagram: instagram.trim().replace(/^@/, "").toLowerCase(),
    country,
    role: "creator",
  } as unknown as never)) as unknown as PostgrestSingleResponse<null>;

  if (dbErr) {
    return NextResponse.json(
      { error: dbErr.code === "23505" ? "duplicate" : dbErr.message },
      { status: dbErr.code === "23505" ? 409 : 500 }
    );
  }

  // Send notification email
  let emailStatus: string = "not_attempted";
  try {
    const { data, error: emailErr } = await resend.emails.send({
      from: "Kreato Waitlist <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject: `New waitlist signup: @${instagram.trim().replace(/^@/, "")}`,
      html: `
        <h2>New Kreato waitlist signup</h2>
        <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:15px;">
          <tr>
            <td style="color:#6b7280;font-weight:600;">Email</td>
            <td>${email.trim().toLowerCase()}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-weight:600;">Instagram</td>
            <td>@${instagram.trim().replace(/^@/, "").toLowerCase()}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-weight:600;">Country</td>
            <td>${country}</td>
          </tr>
        </table>
      `,
    });
    if (emailErr) {
      console.error("[waitlist] Resend error:", JSON.stringify(emailErr));
      emailStatus = `resend_error: ${emailErr.message}`;
    } else {
      console.log("[waitlist] Email sent, id:", data?.id);
      emailStatus = "sent";
    }
  } catch (emailErr) {
    const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
    console.error("[waitlist] Email exception:", msg);
    emailStatus = `exception: ${msg}`;
  }

  return NextResponse.json({ ok: true, emailStatus });
}
