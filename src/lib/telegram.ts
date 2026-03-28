// src/lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const MANAGER_CHAT_ID = process.env.TELEGRAM_MANAGER_CHAT_ID

export async function sendTelegramMessage(message: string, chatId?: string) {
  if (!BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set")
    return
  }

  const targetChatId = chatId || MANAGER_CHAT_ID
  if (!targetChatId) {
    console.warn("No Telegram chat ID configured")
    return
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    )
    return res.json()
  } catch (error) {
    console.error("Telegram send error:", error)
  }
}

export function formatNewOrderMessage(data: {
  orderId: string
  userName: string
  userEmail: string
  userPhone?: string
  templateName: string
  amount: number
  invitationTitle: string
}) {
  const managerUsername = process.env.TELEGRAM_MANAGER_USERNAME || "@manager"
  return `
🎉 <b>Yangi buyurtma!</b>

📋 <b>Buyurtma ID:</b> <code>${data.orderId}</code>
👤 <b>Mijoz:</b> ${data.userName}
📧 <b>Email:</b> ${data.userEmail}
📱 <b>Telefon:</b> ${data.userPhone || "Ko'rsatilmagan"}

🎨 <b>Shablon:</b> ${data.templateName}
📌 <b>Sarlavha:</b> ${data.invitationTitle}
💰 <b>Summa:</b> ${(data.amount / 100).toLocaleString()} so'm

📲 <b>To'lov uchun:</b>
Karta: <code>${process.env.PAYMENT_CARD_NUMBER}</code>

✅ To'lovni tasdiqlash uchun admin paneliga kiring.
  `.trim()
}

export function formatPaymentConfirmMessage(data: {
  orderId: string
  userName: string
  templateName: string
  amount: number
}) {
  return `
✅ <b>To'lov tasdiqlandi!</b>

📋 <b>Buyurtma:</b> <code>${data.orderId}</code>
👤 <b>Mijoz:</b> ${data.userName}
🎨 <b>Shablon:</b> ${data.templateName}
💰 <b>Summa:</b> ${(data.amount / 100).toLocaleString()} so'm

Taklifnomangiz faollashtirildi!
  `.trim()
}

export function formatPaymentRejectedMessage(data: {
  orderId: string
  reason?: string
}) {
  return `
❌ <b>To'lov rad etildi</b>

📋 <b>Buyurtma:</b> <code>${data.orderId}</code>
${data.reason ? `📝 <b>Sabab:</b> ${data.reason}` : ""}

Iltimos, qayta urinib ko'ring yoki support bilan bog'laning.
  `.trim()
}
