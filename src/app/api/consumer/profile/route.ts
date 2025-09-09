import { type NextRequest, NextResponse } from "next/server"
import { consumerMiddleware } from "@/middlewares/consumerMiddleware"
import { getConsumerProfile, updateConsumerProfile } from "@/services/consumer/consumerService"
import { connectDb } from "@/lib/dbConnect"

export async function GET(req: NextRequest) {
  await connectDb()

  try {
    const headersWithUser = await consumerMiddleware(req)
    const userId = headersWithUser.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 })
    }

    const profile = await getConsumerProfile(userId)

    if (!profile.consumer) {
      return NextResponse.json({ message: "Consumer profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ message: error.message || "An error occurred while fetching profile" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  await connectDb()
  try {
    const headersWithUser = await consumerMiddleware(req)
    const userId = headersWithUser.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 })
    }

    const updateData = await req.json()
    const updatedProfile = await updateConsumerProfile(userId, updateData)

    if (!updatedProfile) {
      return NextResponse.json({ message: "Consumer profile not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProfile)
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: error.message || "An error occurred while updating profile" }, { status: 500 })
  }
}
