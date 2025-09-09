import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/services/authService"
import { connectDb } from "@/lib/dbConnect"

export async function POST(req: NextRequest) {
  await connectDb()
  try {
    const { email, password } = await req.json()
    const { token, user } = await loginUser(email, password, "consumer")

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        fullName: user.userName,
        email: user.email,
        userType: user.userType,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message: errorMessage }, { status: 401 })
  }
}
