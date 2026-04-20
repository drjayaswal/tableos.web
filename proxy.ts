import { NextResponse, type NextRequest } from "next/server";

/**
 * NEXT.JS MIDDLEWARE - SESSION GUARD
 * * This middleware performs a "Soft Check" on the client's cookies to determine 
 * authentication status. This avoids a costly network round-trip to the backend
 * for every page transition, improving Core Web Vitals (LCP/INP).
 */
export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Extract the Better Auth session token from the browser cookies
    // Default name is 'better-auth.session_token'. Update if using a custom prefix.
    const sessionToken = request.cookies.get("better-auth.session_token");

    /**
     * LOGIC: REDIRECT AUTHENTICATED USERS
     * If a user is already logged in and tries to access the /connect (login/onboarding) page,
     * we move them straight to the dashboard to improve UX.
     */
    if (sessionToken && pathname.startsWith("/connect")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    /**
     * LOGIC: PROTECT PRIVATE ROUTES
     * If the session cookie is missing, we intercept the request for protected paths
     * defined in the 'matcher' config and redirect to the onboarding flow.
     */
    if (!sessionToken) {
        // Double check to avoid redirect loops if the user is already on /connect
        if (pathname !== "/connect") {
            const loginUrl = new URL("/connect", request.url);
            
            // Optional: Store the intended destination to redirect back after login
            // loginUrl.searchParams.set("callbackUrl", pathname);
            
            return NextResponse.redirect(loginUrl);
        }
    }

    // Allow the request to proceed if it passes the checks above
    return NextResponse.next();
}

/**
 * MIDDLEWARE CONFIGURATION
 * defines which routes trigger this middleware execution.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/dashboard/:path*",
        "/generate",
        "/settings",
        "/connect" // Included here so we can redirect authenticated users away from it
    ],
};