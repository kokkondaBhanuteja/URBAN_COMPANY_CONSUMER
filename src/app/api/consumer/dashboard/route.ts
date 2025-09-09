import { type NextRequest, NextResponse } from "next/server"
import { consumerMiddleware } from "@/middlewares/consumerMiddleware"
import { connectDb } from "@/lib/dbConnect"
import Booking from "@/database/bookingModel"
import Consumer from "@/database/consumerModel"
import { Types } from "mongoose"

export async function GET(req: NextRequest) {
  await connectDb()

  try {
    const headersWithUser = await consumerMiddleware(req)
    const userId = headersWithUser.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 })
    }

    const consumerObjectId = new Types.ObjectId(userId)

    // Get consumer profile
    const consumer = await Consumer.findOne({ userId: consumerObjectId })

    // Get upcoming bookings count
    const upcomingBookingsCount = await Booking.countDocuments({
      consumerId: consumerObjectId,
      bookingStatus: { $in: ["requested", "confirmed", "assigned"] },
      scheduledAt: { $gte: new Date() },
    })

    // Get total bookings
    const totalBookings = await Booking.countDocuments({
      consumerId: consumerObjectId,
    })

    // Get recent bookings
    const recentBookings = await Booking.find({
      consumerId: consumerObjectId,
    })
      .populate("serviceId", "serviceName")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get monthly spending
    const monthlySpendingResult = await Booking.aggregate([
      {
        $match: {
          consumerId: consumerObjectId,
          bookingStatus: "completed",
          completedAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ])

    return NextResponse.json({
      upcomingBookings: upcomingBookingsCount,
      totalBookings: totalBookings,
      monthlySpending: monthlySpendingResult.length > 0 ? monthlySpendingResult[0].total : 0,
      recentBookings: recentBookings,
      consumerProfile: consumer,
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ message: error.message || "An error occurred" }, { status: 500 })
  }
}
