import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/admin");

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // ❗ Login qilmagan user
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/login?redirect=${nextUrl.pathname}`, nextUrl),
    );
  }

  // ❗ Admin check
  if (
    isAdminRoute &&
    isLoggedIn &&
    !["ADMIN", "SUPER_ADMIN"].includes((token as any)?.role || "")
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ❗ Auth page redirect
  if (isLoggedIn && nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
