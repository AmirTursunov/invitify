// src/lib/email.ts
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Invitify <noreply@invitify.uz>",
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Email send error:", error)
    throw error
  }
}

export function orderConfirmedEmailHtml(data: {
  userName: string
  templateName: string
  invitationUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .body { padding: 40px; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ To'lovingiz tasdiqlandi!</h1>
    </div>
    <div class="body">
      <p>Assalomu alaykum, <strong>${data.userName}</strong>!</p>
      <p>Tabriklaymiz! <strong>${data.templateName}</strong> uchun buyurtmangiz muvaffaqiyatli tasdiqlandi.</p>
      <p>Endi taklifnomangiz faol va mehmonlaringizga ulashishingiz mumkin:</p>
      <a href="${data.invitationUrl}" class="btn">Taklifnomani ko'rish →</a>
      <p style="margin-top: 30px; color: #888; font-size: 14px;">
        Savollaringiz bo'lsa, bizga Telegram orqali yozishingiz mumkin: ${process.env.TELEGRAM_MANAGER_USERNAME}
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Invitify. Barcha huquqlar himoyalangan.</p>
    </div>
  </div>
</body>
</html>
  `
}

export function welcomeEmailHtml(userName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .body { padding: 40px; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Invitify'ga xush kelibsiz!</h1>
    </div>
    <div class="body">
      <p>Assalomu alaykum, <strong>${userName}</strong>!</p>
      <p>Invitify platformasiga muvaffaqiyatli ro'yxatdan o'tdingiz!</p>
      <p>Endi siz:</p>
      <ul>
        <li>18+ xil shablon ichidan tanlashingiz</li>
        <li>To'y, tug'ilgan kun, konsert va boshqa tadbirlar uchun taklifnoma yaratishingiz</li>
        <li>Mehmonlaringizga havolani ulashishingiz mumkin</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/templates" class="btn">Shablon tanlash →</a>
    </div>
  </div>
</body>
</html>
  `
}
