// src/app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/layout/session-provider"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: {
    default: "Invitify — Taklifnoma yaratish platformasi",
    template: "%s | Invitify",
  },
  description:
    "To'y, tug'ilgan kun, konsert, meeting va boshqa tadbirlar uchun professional taklifnomalar yarating.",
  keywords: ["taklifnoma", "invitation", "to'y", "wedding", "tug'ilgan kun", "konsert", "uzbekistan"],
  openGraph: {
    title: "Invitify",
    description: "Professional taklifnomalar yarating",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Invitify",
    locale: "uz_UZ",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
