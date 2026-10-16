import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAccount = pathname === "/account" || pathname.startsWith("/account/");
  const isCheckout = pathname === "/checkout" || pathname.startsWith("/checkout/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isAccount && !isCheckout && !isAdmin) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const nextPath = isAdmin ? "/admin" : pathname;

  if (!session || (isAdmin && session.role !== "admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/checkout",
    "/checkout/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
