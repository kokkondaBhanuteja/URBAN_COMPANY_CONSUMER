import { type NextRequest, NextResponse } from "next/server"
import { setCookie } from "@/lib/cookie-helper"
import { loginWithGoogle } from "@/services/backend-auth-service"
import { connectDb } from "@/lib/dbConnect"
import logger from "@/lib/logger"

export async function GET(req: NextRequest) {
  await connectDb()

  try {
    const { searchParams } = req.nextUrl
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("error", "Google authentication was cancelled")
      return NextResponse.redirect(loginUrl)
    }

    if (!code) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("error", "No authorization code received from Google")
      return NextResponse.redirect(loginUrl)
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${req.nextUrl.origin}/api/auth/google/callback`,
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || "Failed to exchange code for tokens")
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const profile = await profileResponse.json()

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch user profile from Google")
    }

    const { token, user } = await loginWithGoogle(profile.id, {
      userName: profile.name || profile.email?.split("@")[0] || "Google User",
      email: profile.email,
    })

    const successUrl = new URL("/auth/success", req.url)
    const response = NextResponse.redirect(successUrl)

    setCookie(response, "token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    return response
  } catch (error) {
    logger.error("Google OAuth callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("error", errorMessage)
    return NextResponse.redirect(loginUrl)
  }
}