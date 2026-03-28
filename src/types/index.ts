// src/types/index.ts
import type { ObjectId } from "mongodb"

export interface DbUser {
  _id?: ObjectId
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
  password?: string | null
  role: string
  phone?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface DbTemplate {
  _id?: ObjectId
  name: string
  slug: string
  description?: string | null
  category: string
  previewImage?: string | null
  thumbnail?: string | null
  isActive: boolean
  isPremium: boolean
  price: number
  sortOrder: number
  fields: TemplateFields
  styles: TemplateStyles
  createdAt: Date
  updatedAt: Date
}

export interface DbInvitation {
  _id?: ObjectId
  userId: string
  templateId: string
  title: string
  slug: string
  data: InvitationData
  customStyles?: Record<string, unknown> | null
  status: InvitationStatus
  viewCount: number
  publicUrl?: string | null
  qrCode?: string | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface DbOrder {
  _id?: ObjectId
  userId: string
  invitationId: string
  amount: number
  status: OrderStatus
  paymentProof?: string | null
  telegramNote?: string | null
  adminNote?: string | null
  paidAt?: Date | null
  confirmedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN"
export type InvitationStatus = "DRAFT" | "PENDING_PAYMENT" | "PAID" | "ACTIVE" | "EXPIRED" | "CANCELLED"
export type OrderStatus = "PENDING" | "PAYMENT_SENT" | "CONFIRMED" | "REJECTED" | "REFUNDED"

export interface TemplateField {
  label: string
  type: "text" | "textarea" | "date" | "time" | "number" | "email" | "tel" | "url" | "select"
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface TemplateFields {
  [key: string]: TemplateField
}

export interface TemplateStyles {
  primaryColor: string
  bgColor: string
  font: string
  accent: string
  dark?: boolean
}

export interface InvitationData {
  [key: string]: string | number | undefined
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Serializable versions (for passing to client components)
export interface Template extends Omit<DbTemplate, "_id"> {
  id: string
}

export interface Invitation extends Omit<DbInvitation, "_id"> {
  id: string
}

export interface Order extends Omit<DbOrder, "_id"> {
  id: string
}

export interface User extends Omit<DbUser, "_id" | "password"> {
  id: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  WEDDING: "To'y",
  BIRTHDAY: "Tug'ilgan kun",
  MEETING: "Uchrashuv",
  CONCERT: "Konsert",
  CORPORATE: "Korporativ",
  GRADUATION: "Bitirish",
  ANNIVERSARY: "Yubileyi",
  BABY_SHOWER: "Chilla",
  ENGAGEMENT: "Unashtiruv",
  SPORTS: "Sport",
  CONFERENCE: "Konferensiya",
  TICKET: "Chipta",
  OTHER: "Boshqa",
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Kutilmoqda", color: "yellow" },
  PAYMENT_SENT: { label: "To'lov yuborildi", color: "blue" },
  CONFIRMED: { label: "Tasdiqlandi", color: "green" },
  REJECTED: { label: "Rad etildi", color: "red" },
  REFUNDED: { label: "Qaytarildi", color: "gray" },
}

export const INVITATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Qoralama", color: "gray" },
  PENDING_PAYMENT: { label: "To'lov kutilmoqda", color: "yellow" },
  PAID: { label: "To'langan", color: "blue" },
  ACTIVE: { label: "Faol", color: "green" },
  EXPIRED: { label: "Muddati o'tgan", color: "red" },
  CANCELLED: { label: "Bekor qilingan", color: "gray" },
}
