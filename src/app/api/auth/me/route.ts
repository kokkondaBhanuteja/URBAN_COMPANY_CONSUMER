import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDb } from "@/lib/dbConnect"
import User from "@/database/userModel"
import logger from "@/lib/logger"

export async function GET(req: NextRequest) {
  await connectDb()

  try {
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id,
      fullName: user.userName,
      email: user.email,
      userType: user.userType,
    })
  } catch (error) {
    logger.error("Auth 'me' error:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}