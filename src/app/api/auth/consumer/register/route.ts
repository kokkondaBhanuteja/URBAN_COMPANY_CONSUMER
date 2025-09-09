import { type NextRequest, NextResponse } from "next/server"
import { registerConsumer } from "@/services/authService"
import { connectDb } from "@/lib/dbConnect"

export async function POST(req: NextRequest) {
  await connectDb()
  try {
    const body = await req.json()
    const user = await registerConsumer(body)

    return NextResponse.json(
      {
        message: "Consumer registered successfully",
        userId: user._id,
        userType: user.userType,
      },
      { status: 201 },
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
