import { NextResponse } from "next/server";

export function middleware(request) {
  const user = request.cookies.get("ofm_user");
  const { pathname } = request.nextUrl;

  // If trying to access dashboard without being logged in → redirect to login
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If already logged in and trying to access login → redirect to dashboard
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
