import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// DISABLED: Authentication middleware - enable after testing
export default auth((req) => {
  // Skip authentication for all routes during testing
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};