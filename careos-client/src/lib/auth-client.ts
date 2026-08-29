import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 
  ? process.env.NEXT_PUBLIC_API_BASE_URL.replace("/api/v1", "") 
  : "http://localhost:5000";

export const authClient = createAuthClient({
    baseURL: BASE_URL,
    plugins: [
        emailOTPClient(),
    ],
});