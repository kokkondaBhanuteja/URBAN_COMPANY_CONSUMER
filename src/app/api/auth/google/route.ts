import { type NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

    if (!clientId) {
      throw new Error("Google Client ID not configured");
    }

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "profile email");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    logger.error("Google Auth Redirect Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", `Authentication failed: ${errorMessage}`);
    return NextResponse.redirect(loginUrl);
  }
}