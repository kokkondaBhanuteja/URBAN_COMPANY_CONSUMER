import { type NextRequest, NextResponse } from "next/server";
import { sendOtp } from "@/services/otp-service";
import { connectDb } from "@/lib/dbConnect";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { email } = await req.json();
    await sendOtp(email);
    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error: any) {
    logger.error("Send OTP error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send OTP" },
      { status: 400 }
    );
  }
}