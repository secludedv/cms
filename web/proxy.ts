import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_COOKIE = "cms-token";
const DEFAULT_JWT_SECRET =
  "dGhpcyBpcyBhIHZlcnkgc2VjdXJlIHNlY3JldCBrZXkgZm9yIGNtcyBhcHBsaWNhdGlvbg==";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

// Routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/api", "/_next", "/favicon.ico"];

// Role-to-route mapping
const ROLE_ROUTES: Record<string, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  ENGINEER: "/engineer",
  CUSTOMER: "/customer",
};

// Protected route prefixes and which role can access them
const PROTECTED_PREFIXES: Record<string, string> = {
  "/admin": "ADMIN",
  "/manager": "MANAGER",
  "/engineer": "ENGINEER",
  "/customer": "CUSTOMER",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Special case: if on /login and already authenticated, redirect to dashboard
    if (pathname === "/login") {
      const token = request.cookies.get(TOKEN_COOKIE)?.value;
      const role = await getRoleFromToken(token);

      if (role && ROLE_ROUTES[role]) {
        return NextResponse.redirect(new URL(ROLE_ROUTES[role], request.url));
      }
    }
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = await getRoleFromToken(token);

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Root path — redirect to role's home
  if (pathname === "/") {
    if (ROLE_ROUTES[role]) {
      return NextResponse.redirect(new URL(ROLE_ROUTES[role], request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check role-based access for protected routes
  for (const [prefix, requiredRole] of Object.entries(PROTECTED_PREFIXES)) {
    if (pathname.startsWith(prefix)) {
      if (role !== requiredRole) {
        // Redirect to their own dashboard
        const correctPath = ROLE_ROUTES[role] || "/login";
        return NextResponse.redirect(new URL(correctPath, request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

async function getRoleFromToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const secret = Uint8Array.from(atob(JWT_SECRET), (char) =>
      char.charCodeAt(0),
    );
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
