import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // We can't access localStorage in middleware as it runs on the server
  // Instead, we'll rely on client-side authentication checks
  // and let the courses page handle the redirect if needed

  // Define public routes that don't require authentication
  const isPublicRoute = pathname === "/" || pathname.startsWith("/api");

  // For auth pages, we don't need to check authentication
  if (isAuthPage) {
    return NextResponse.next();
  }

  // For public routes, we don't need to check authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, we'll let the client-side handle authentication
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
