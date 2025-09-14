import { type NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { verifyOtp } from "@/services/otp-service"
import User from "@/database/userModel"
import Consumer from "@/database/consumerModel"
import Wallet from "@/database/walletModel" 
import Address from "@/database/addressmodel"
import jwt from "jsonwebtoken"
import { setCookie } from "@/lib/cookie-helper"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h"

export async function POST(req: NextRequest) {
  await connectDb()
  try {
    const { otp, ...userData } = await req.json()
    const { email } = userData

    const isOtpValid = await verifyOtp(email, otp)
    if (!isOtpValid) {
      throw new Error("Invalid or expired OTP. Please try again.")
    }

    const newUser = new User({
      ...userData,
      email: email.toLowerCase(),
      isVerified: true,
    })
    await newUser.save()

    const newWallet = new Wallet({
      userId: newUser._id,
      balance: 0,
    });
    await newWallet.save();

    const newAddress = new Address({
        userId: newUser._id,
        ...userData.address
    });
    await newAddress.save();

    const newConsumer = new Consumer({
      userId: newUser._id,
      walletId: newWallet._id, 
      address: newAddress,
    })
    await newConsumer.save()

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

    setCookie(response, "token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60, 
      path: "/",
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to verify OTP" }, { status: 400 })
  }
}