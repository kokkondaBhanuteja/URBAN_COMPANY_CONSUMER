import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/services/backend-auth-service"
import { connectDb } from "@/lib/dbConnect"
import { setCookie } from "@/lib/cookie-helper"

export async function POST(req: NextRequest) {
  await connectDb()
  try {
    const { email, password } = await req.json()
    const { token, user } = await loginUser(email, password, "consumer")

    const response = NextResponse.json({
      user: {
        id: user._id,
        fullName: user.userName,
        email: user.email,
        userType: user.userType,
      },
    })

    setCookie(response, "token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message: errorMessage }, { status: 401 })
  }
}
