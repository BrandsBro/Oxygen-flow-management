import { NextResponse } from "next/server";

export function middleware(request) {
  const userCookie = request.cookies.get("ofm_user");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !userCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && userCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const adminOnlyPaths = [
    "/dashboard/tasks",
    "/dashboard/cases",
    "/dashboard/reports",
    "/dashboard/team",
    "/dashboard/settings",
    "/dashboard/invoices",
    "/dashboard/authority",
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
