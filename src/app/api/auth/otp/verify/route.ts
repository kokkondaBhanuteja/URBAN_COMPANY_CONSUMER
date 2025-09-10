import { type NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { verifyOtp } from "@/services/otp-service"
import User from "@/database/userModel"
import Consumer from "@/database/consumerModel"
import jwt from "jsonwebtoken"
import { setCookie } from "@/lib/cookie-helper"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h"

export async function POST(req: NextRequest) {
  await connectDb()
  try {
    // The request now contains the full user data along with the OTP
    const { otp, ...userData } = await req.json()
    const { email, password } = userData

    // Step 1: Verify the OTP first
    const isOtpValid = await verifyOtp(email, otp)
    if (!isOtpValid) {
      throw new Error("Invalid or expired OTP. Please try again.")
    }

    // Step 2: If OTP is valid, create the User and Consumer in the database
    const newUser = new User({
      ...userData,
      email: email.toLowerCase(),
      isVerified: true, // Mark as verified since OTP was successful
    })
    await newUser.save()

    const newConsumer = new Consumer({
      userId: newUser._id,
      address: userData.address,
    })
    await newConsumer.save()

    // Step 3: Automatically log the user in by creating a session token
    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        userType: newUser.userType,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )

    const response = NextResponse.json({
      message: "Registration successful!",
      user: {
        id: newUser._id,
        fullName: newUser.userName,
        email: newUser.email,
        userType: newUser.userType,
      },
    })

    // Set the httpOnly cookie for the new session
    setCookie(response, "token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to verify OTP" }, { status: 400 })
  }
}
