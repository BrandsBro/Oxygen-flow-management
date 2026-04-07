import { NextResponse } from "next/server";

export function middleware(request) {
  const userCookie = request.cookies.get("ofm_user");
  const { pathname } = request.nextUrl;

  // Not logged in → go to login
  if (pathname.startsWith("/dashboard") && !userCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in → skip login page
  if (pathname === "/login" && userCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect admin-only pages
  const adminOnlyPaths = [
    "/dashboard/tasks",
    "/dashboard/cases",
    "/dashboard/reports",
    "/dashboard/team",
    "/dashboard/settings",
  ];

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      const isAdminPath = adminOnlyPaths.some(p => pathname.startsWith(p));
      if (isAdminPath && user.role !== "Admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
