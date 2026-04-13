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

  if (!orderId || !productId || !buyerName || !buyerTelegram) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Read product — telegram_bot_token stays server-side and is never sent to browser
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, telegram_link, telegram_bot_token")
    .eq("id", productId)
    .eq("active", true)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // If the product has no Telegram config, mark paid and return early
  if (!product.telegram_bot_token || !product.telegram_link) {
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    return NextResponse.json({ inviteLink: null });
  }

  // Extract the username part from whatever the creator stored
  // Handles: "mycryptogroup", "t.me/mycryptogroup", "https://t.me/mycryptogroup", "@mycryptogroup"
  const chatId = product.telegram_link
    .replace(/^https?:\/\//i, "")
    .replace(/^t\.me\//i, "")
    .replace(/^@/, "")
    .split("?")[0]
    .trim();

  let inviteLink: string | null = null;

  try {
    inviteLink = await sendTelegramInvite(
      product.telegram_bot_token,
      chatId,
      buyerTelegram,
      buyerName
    );
  } catch (err) {
    console.error("[checkout/complete] Telegram invite failed:", err);
  }

  // Update order status to "paid"
  // Requires the Supabase RLS UPDATE policy described in supabase/orders_table.sql
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId);

  if (updateError) {
    console.warn("[checkout/complete] Order status update failed:", updateError.message);
  }

  return NextResponse.json({ inviteLink });
}
