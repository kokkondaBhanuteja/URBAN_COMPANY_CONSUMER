import { type NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/services/backend-auth-service"
import { connectDb } from "@/lib/dbConnect"
import User from "@/database/userModel"

export async function POST(req: NextRequest) {
  await connectDb()
  try {
    const { email, otp } = await req.json()
    await verifyOTP(email, otp)

    await User.updateOne({ email }, { $set: { isVerified: true } })
    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to verify OTP" }, { status: 400 })
  }
}
