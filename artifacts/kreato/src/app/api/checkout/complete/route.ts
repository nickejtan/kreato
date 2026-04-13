import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTelegramInvite } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { orderId, productId, buyerName, buyerTelegram } = body as {
    orderId: string;
    productId: string;
    buyerName: string;
    buyerTelegram: string;
  };

  console.log("[checkout/complete] POST received", { orderId, productId, buyerName, buyerTelegram });

  if (!orderId || !productId || !buyerName || !buyerTelegram) {
    console.error("[checkout/complete] Missing required fields in body");
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Read product — telegram_bot_token stays server-side and never goes to the browser
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, telegram_link, telegram_bot_token")
    .eq("id", productId)
    .eq("active", true)
    .single();

  console.log("[checkout/complete] product query error:", productError?.message ?? "none");
  console.log("[checkout/complete] product found:", product ? "yes" : "no");

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  console.log("[checkout/complete] raw telegram_link from DB:", JSON.stringify(product.telegram_link));
  console.log("[checkout/complete] telegram_bot_token exists:", !!product.telegram_bot_token);
  console.log("[checkout/complete] telegram_bot_token length:", product.telegram_bot_token?.length ?? 0);

  // If the product has no Telegram config, mark paid and return early
  if (!product.telegram_bot_token || !product.telegram_link) {
    console.warn("[checkout/complete] No Telegram config on product — skipping invite");
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    return NextResponse.json({ inviteLink: null });
  }

  // Extract the bare username from whatever format the creator saved:
  // "kreatotest", "t.me/kreatotest", "https://t.me/kreatotest", "@kreatotest"
  const chatId = product.telegram_link
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^t\.me\//i, "")
    .replace(/^@/, "")
    .split(/[?/]/)[0]   // trim query strings and any trailing paths
    .trim();

  console.log("[checkout/complete] extracted chatId (bare username, no @):", JSON.stringify(chatId));

  if (!chatId) {
    console.error("[checkout/complete] chatId is empty after extraction — aborting Telegram call");
    return NextResponse.json({ inviteLink: null });
  }

  let inviteLink: string | null = null;

  try {
    inviteLink = await sendTelegramInvite(
      product.telegram_bot_token,
      chatId,
      buyerTelegram,
      buyerName
    );
    console.log("[checkout/complete] invite link returned:", inviteLink);
  } catch (err) {
    console.error("[checkout/complete] sendTelegramInvite threw:", err);
  }

  // Update order status to "paid"
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId);

  if (updateError) {
    console.warn("[checkout/complete] order status update failed:", updateError.message);
  } else {
    console.log("[checkout/complete] order status updated to paid");
  }

  console.log("[checkout/complete] responding with inviteLink:", inviteLink ?? "null");
  return NextResponse.json({ inviteLink });
}
