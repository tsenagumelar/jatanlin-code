import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Check if user is authenticated (simplified - in production, use proper JWT validation)
  const isAuthenticated =
    request.cookies.get("isAuthenticated")?.value === "true";

  // Public routes that don't require authentication
  const isPublicRoute = pathname.startsWith("/login") || pathname === "/";

  // Private routes that require authentication
  const isPrivateRoute =
    pathname.startsWith("/beranda") || pathname.startsWith("/(private)") || pathname.startsWith("/v2");

  // Redirect logic
  if (!isAuthenticated && isPrivateRoute) {
    // User is not authenticated and trying to access private route
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    // User is authenticated but trying to access login page
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
