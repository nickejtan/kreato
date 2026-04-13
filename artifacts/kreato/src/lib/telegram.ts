const TELEGRAM_API = "https://api.telegram.org";

/**
 * Creates a one-time Telegram invite link for a group and sends it to the buyer.
 * The bot must be an admin of the chat to create invite links.
 *
 * @param botToken      - The Telegram bot token (from BotFather)
 * @param chatId        - The group username WITHOUT @ e.g. "kreatotest"
 * @param buyerTelegram - Buyer's Telegram username (without @)
 * @param buyerName     - Buyer's full name for the welcome message
 * @returns The invite link string
 */
export async function sendTelegramInvite(
  botToken: string,
  chatId: string,
  buyerTelegram: string,
  buyerName: string
): Promise<string> {
  const expireDate = Math.floor(Date.now() / 1000) + 86_400; // 24 hours
  const formattedChatId = `@${chatId}`;
  const apiUrl = `${TELEGRAM_API}/bot[REDACTED]/createChatInviteLink`;

  console.log("[telegram] sendTelegramInvite called");
  console.log("[telegram] chatId (raw, no @):", chatId);
  console.log("[telegram] formatted chat_id sent to Telegram:", formattedChatId);
  console.log("[telegram] API endpoint:", apiUrl);
  console.log("[telegram] expire_date:", expireDate, "(", new Date(expireDate * 1000).toISOString(), ")");

  // Step 1: Create a one-time invite link
  const inviteRes = await fetch(
    `${TELEGRAM_API}/bot${botToken}/createChatInviteLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: formattedChatId,
        member_limit: 1,
        expire_date: expireDate,
        name: "Kreato Purchase",
      }),
    }
  );

  const inviteData = await inviteRes.json();

  console.log("[telegram] createChatInviteLink HTTP status:", inviteRes.status);
  console.log("[telegram] createChatInviteLink response:", JSON.stringify(inviteData));

  if (!inviteData.ok) {
    const msg = `Telegram createChatInviteLink failed [error_code=${inviteData.error_code}]: ${inviteData.description}`;
    console.error("[telegram]", msg);
    throw new Error(msg);
  }

  const inviteLink: string = inviteData.result.invite_link;
  console.log("[telegram] invite link created successfully:", inviteLink);

  // Step 2: Send the buyer a direct message with the link (best-effort).
  // NOTE: Telegram only allows bots to send private messages to users who have
  // already started a conversation with the bot. If the buyer hasn't done this,
  // the sendMessage call will fail — we catch that silently and still return the
  // invite link so it can be shown on the success page.
  console.log("[telegram] attempting sendMessage to @" + buyerTelegram);
  try {
    const msgRes = await fetch(
      `${TELEGRAM_API}/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: `@${buyerTelegram}`,
          text:
            `🎉 Welcome, ${buyerName}!\n\n` +
            `Here's your exclusive invite link:\n${inviteLink}\n\n` +
            `⚠️ This link is valid for 24 hours and can only be used once. ` +
            `Do not share it.`,
        }),
      }
    );

    const msgData = await msgRes.json();
    console.log("[telegram] sendMessage response:", JSON.stringify(msgData));

    if (!msgData.ok) {
      console.warn(
        `[telegram] sendMessage to @${buyerTelegram} failed (non-fatal): ${msgData.description}`
      );
    } else {
      console.log("[telegram] sendMessage succeeded");
    }
  } catch (err) {
    console.warn("[telegram] sendMessage threw (non-fatal):", err);
  }

  return inviteLink;
}
