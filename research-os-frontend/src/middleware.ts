import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isPublicAsset = req.nextUrl.pathname.startsWith("/_next") || req.nextUrl.pathname === "/favicon.ico";

  if (!isLoggedIn && !isAuthPage && !isApiRoute && !isPublicAsset) {
    return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};