import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
} from "@/lib/authUtils";
import { jwtUtils } from "@/lib/jwtUtils";

// ── Add this ──
const PUBLIC_ROUTES = [
  "/",
  "/features",
  "/privacy",
  "/cookies",
  "/terms",
  "/accessibility",
  "/pricing",
  "/security",
  "/compliance",
  "/integrations",
  "/about",
  "/blog",
  "/careers",
  "/contact",
  "/partners",
  "/docs",
  "/help",
  "/api", 
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathWithQuery = `${pathname}${search}`;

  const accessToken = request.cookies.get("accessToken")?.value;
  const decodedToken = accessToken ? jwtUtils.decodeEdgeSafe(accessToken) : null;
  const userRole = decodedToken?.role as string | null;

  const isAuth = isAuthRoute(pathname);
  const routeOwner = getRouteOwner(pathname);

  if (isAuth && accessToken && userRole) {
    return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url));
  }

  if (!accessToken || !userRole) {
    if (isAuth || isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathWithQuery);
    return NextResponse.redirect(loginUrl);
  }

  const roleBasePaths = ["/admin", "/owner", "/teacher", "/guardian"];
  if (roleBasePaths.includes(pathname)) {
    return NextResponse.redirect(new URL(`${pathname}/dashboard`, request.url));
  }

  if (routeOwner && routeOwner !== "COMMON") {
    if (routeOwner !== userRole) {
      return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)",
  ],
};