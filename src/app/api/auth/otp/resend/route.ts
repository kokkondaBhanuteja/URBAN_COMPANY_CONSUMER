import { type NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import { sendOtp } from "@/services/otp-service"; // Corrected import

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Use the imported sendOtp function
    await sendOtp(email);

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to send OTP" },
      { status: 400 }
    );
  }
}