import { type NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import { sendOtp } from "@/services/otp-service";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await sendOtp(email);

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error: any) {
    logger.error("Resend OTP error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send OTP" },
      { status: 400 }
    );
  }
}