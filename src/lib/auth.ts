// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";

declare module "next-auth" {
  interface User {
    role?: string;
    id?: string;
  }
  interface Session {
    user: User & {
      role?: string;
      id?: string;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    role?: string;
    id?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    error: "/auth/error",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const db = await getDb();
          const user = await db.collection("users").findOne({
            email: credentials.email as string,
          });
          if (!user || !user.password) return null;
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );
          if (!isValid) return null;
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign-in - create user if not exists
      if (account?.provider === "google") {
        try {
          const db = await getDb();
          const existing = await db
            .collection("users")
            .findOne({ email: user.email });
          if (!existing) {
            await db.collection("users").insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "USER",
              emailVerified: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (e) {
          console.error("Google signIn error:", e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      // Fetch fresh role from DB on each token refresh
      if (token.email && !token.role) {
        try {
          const db = await getDb();
          const dbUser = await db
            .collection("users")
            .findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
