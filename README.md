# ✨ Invitify — Taklifnoma yaratish platformasi

O'zbekiston uchun professional taklifnoma yaratish web platformasi.

## 🛠 Tech Stack

| | |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | MongoDB Atlas |
| **ORM** | Prisma 5 |
| **Auth** | NextAuth v5 (Email + Google) |
| **Styling** | Tailwind CSS |
| **Storage** | Cloudinary |
| **Email** | Nodemailer (Gmail) |
| **Notifications** | Telegram Bot API |
| **QR** | qrcode |

---

## 🚀 O'rnatish

### 1. Loyihani oling

```bash
unzip invitify.zip
cd invitify
npm install
```

### 2. MongoDB Atlas sozlash (bepul)

1. [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) — bepul hisob oching
2. **New Project** → **Build a Database** → **Free (M0)**
3. Username + Password kiriting, eslab qoling
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
5. **Connect** → **Drivers** → connection string nusxalang:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/invitify?retryWrites=true&w=majority
   ```

### 3. Telegram Bot (to'lov xabarlari uchun)

1. Telegram da [@BotFather](https://t.me/BotFather) ga yozing
2. `/newbot` → ismi va username bering
3. **Token** nusxalang → `TELEGRAM_BOT_TOKEN`
4. [@userinfobot](https://t.me/userinfobot) ga yozing → **Chat ID** oling → `TELEGRAM_MANAGER_CHAT_ID`

### 4. Environment variables

```bash
cp .env.example .env
```

`.env` faylini to'ldiring (muhim bo'lganlar):

```env
DATABASE_URL="mongodb+srv://..."     # MongoDB Atlas URL
NEXTAUTH_SECRET="..."                # openssl rand -base64 32
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_MANAGER_CHAT_ID="..."
PAYMENT_CARD_NUMBER="8600 ..."
```

### 5. Database va seed

```bash
# Prisma client generate
npm run db:generate

# 18 ta shablon + admin yaratish
npm run db:seed
```

> MongoDB bilan `db:push` shart emas — Atlas avtomatik collection yaratadi!

### 6. Ishga tushirish

```bash
npm run dev
# http://localhost:3000
```

---

## 📁 Loyiha strukturasi

```
invitify/
├── prisma/
│   ├── schema.prisma        # MongoDB modellari
│   └── seed.ts              # 18 shablon + admin
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing
│   │   ├── auth/login|register/      # Auth sahifalari
│   │   ├── templates/                # Shablonlar
│   │   ├── dashboard/                # User panel
│   │   ├── invite/[slug]/            # Public taklif
│   │   ├── admin/                    # Admin panel
│   │   └── api/                      # REST API routes
│   ├── components/ui/                # Client components
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config
│   │   ├── prisma.ts        # DB client
│   │   ├── telegram.ts      # Bot xabarlari
│   │   └── email.ts         # Gmail
│   └── types/index.ts       # TypeScript types
```

---

## 🔄 Foydalanuvchi oqimi

```
1. /templates → 18 shablon ichidan tanlash
2. Ro'yxatdan o'tish (email yoki Google)
3. /dashboard/create → Ma'lumot kiritish
4. Buyurtma berish → karta raqami + Telegram ko'rsatiladi
5. Foydalanuvchi pul o'tkazadi → Telegram'da skrinshotni yuboradi
6. Admin /admin/orders da "Tasdiqlash" bosadi
7. Taklifnoma faollashadi → /invite/[slug] da ochiladi
8. Foydalanuvchiga email keladi
```

---

## 💳 To'lov jarayoni (Telegram)

Stripe yoki Click o'rniga oddiy va ishonchli:

1. Buyurtma yaratilganda → **Admin Telegramga xabar keladi**
2. Foydalanuvchiga **karta raqami** ko'rsatiladi
3. Foydalanuvchi pul o'tkazadi + **skrinshotni @username ga yuboradi**
4. Admin **1 click** bilan tasdiqlaydi
5. Taklifnoma **avtomatik faollashadi** + email yuboriladi

---

## 🌐 Production (Vercel)

```bash
# 1. GitHub ga push
git init && git add . && git commit -m "init"
git remote add origin https://github.com/USER/invitify.git
git push -u origin main

# 2. vercel.com → Import → Environment Variables qo'shing

# 3. Deploy bo'lgandan keyin seed
npx vercel env pull .env.local
npm run db:seed
```

---

## 👤 Admin panel

- URL: `/admin`
- Login: `.env` dagi `ADMIN_EMAIL` + `ADMIN_PASSWORD`
- **Buyurtmalar**: tasdiqlash / rad etish
- **Foydalanuvchilar**: ro'yxat
- **Shablonlar**: yoqish/o'chirish
- **Statistika**: tushum, eng ko'p ishlatilanlar

---

## 📞 Muammo bo'lsa

Telegram: @invitify_support
