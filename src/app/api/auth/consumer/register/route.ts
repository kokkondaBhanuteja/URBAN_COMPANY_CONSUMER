import { type NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { sendOtp } from "@/services/otp-service"
import User from "@/database/userModel"

export async function POST(req: NextRequest) {
  await connectDb()
  try {
    const body = await req.json()
    const { email, mobileNumber } = body

    // Check if a VERIFIED user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { mobileNumber }],
      isVerified: true, // Only check against verified users
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new Error("An account with this email already exists.")
      }
      if (existingUser.mobileNumber === mobileNumber) {
        throw new Error("An account with this mobile number already exists.")
      }
    }

    // Note: We are NOT saving the user here anymore.
    // We only send the OTP. The user will be created upon verification.
    await sendOtp(email)

    return NextResponse.json(
      {
        message: "OTP sent to your email successfully. Please verify to complete registration.",
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Registration failed",
      },
      { status: 400 },
    )
  }
}
