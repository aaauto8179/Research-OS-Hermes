import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  if (!isLoggedIn && !isAuthPage && !isApiRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};