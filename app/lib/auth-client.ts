import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

/**
 * Auth Client (Better Auth)
 * 
 * Configures the client-side engine for authentication and session management.
 * Connects to the primary backend API to handle stage-based flows (Connect/Continue).
 */
export const authClient = createAuthClient({
    /**
     * Base URL for the backend API.
     * Ensure this environment variable is set to the correct Elysia server address.
     */
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
    
    plugins: [
        /**
         * Email OTP Plugin
         * Enables passwordless authentication via secure, time-limited verification codes.
         */
        emailOTPClient()
    ]
});

export const { useSession, signIn, signUp, signOut } = authClient;
