import { clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
