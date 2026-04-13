const TELEGRAM_API = "https://api.telegram.org";

/**
 * Creates a one-time Telegram invite link for a group and sends it to the buyer.
 * The bot must be an admin of the chat to create invite links.
 *
 * @param botToken   - The Telegram bot token (from BotFather)
 * @param chatId     - The group username e.g. "mycryptogroup" (without @) or numeric ID
 * @param buyerTelegram - Buyer's Telegram username (without @)
 * @param buyerName  - Buyer's full name for the welcome message
 * @returns The invite link string
 */
export async function sendTelegramInvite(
  botToken: string,
  chatId: string,
  buyerTelegram: string,
  buyerName: string
): Promise<string> {
  const expireDate = Math.floor(Date.now() / 1000) + 86_400; // 24 hours

  // Step 1: Create a one-time invite link
  const inviteRes = await fetch(
    `${TELEGRAM_API}/bot${botToken}/createChatInviteLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: `@${chatId}`,
        member_limit: 1,
        expire_date: expireDate,
        name: "Kreato Purchase",
      }),
    }
  );

  const inviteData = await inviteRes.json();

  if (!inviteData.ok) {
    throw new Error(
      `Telegram createChatInviteLink failed: ${inviteData.description}`
    );
  }

  const inviteLink: string = inviteData.result.invite_link;

  // Step 2: Send the buyer a direct message with the link (best-effort).
  // NOTE: Telegram only allows bots to send private messages to users who have
  // already started a conversation with the bot. If the buyer hasn't done this,
  // the sendMessage call will fail — we catch that silently and still return the
  // invite link so it can be shown on the success page.
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
    if (!msgData.ok) {
      console.warn(
        `[telegram] sendMessage to @${buyerTelegram} failed: ${msgData.description}`
      );
    }
  } catch (err) {
    console.warn("[telegram] sendMessage threw:", err);
  }

  return inviteLink;
}
