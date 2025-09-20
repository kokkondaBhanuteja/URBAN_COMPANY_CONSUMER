import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear the authentication cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("Logout error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}