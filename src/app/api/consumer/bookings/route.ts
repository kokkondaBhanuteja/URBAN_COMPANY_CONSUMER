import { type NextRequest, NextResponse } from "next/server"
import { consumerMiddleware } from "@/middlewares/consumerMiddleware"
import Booking from "@/database/bookingModel"
import { connectDb } from "@/lib/dbConnect"
import { Types } from "mongoose"

export async function GET(req: NextRequest) {
  await connectDb()

  try {
    const headersWithUser = await consumerMiddleware(req)
    const userId = headersWithUser.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = { consumerId: new Types.ObjectId(userId) }
    if (status) {
      query.bookingStatus = status
    }

    const bookings = await Booking.find(query)
      .populate("serviceId", "serviceName basePrice")
      .populate("providerId", "userId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Booking.countDocuments(query)

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Bookings fetch error:", error)
    return NextResponse.json({ message: error.message || "An error occurred while fetching bookings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  await connectDb()

  try {
    const headersWithUser = await consumerMiddleware(req)
    const userId = headersWithUser.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 })
    }

    const bookingData = await req.json()

    const booking = new Booking({
      consumerId: new Types.ObjectId(userId),
      serviceId: new Types.ObjectId(bookingData.serviceId),
      serviceAddress: bookingData.serviceAddress,
      scheduledAt: new Date(bookingData.scheduledAt),
      totalPrice: bookingData.totalPrice,
      specialInstructions: bookingData.specialInstructions,
    })

    await booking.save()

    return NextResponse.json(
      {
        message: "Booking created successfully",
        bookingId: booking._id,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Booking creation error:", error)
    return NextResponse.json({ message: error.message || "An error occurred while creating booking" }, { status: 500 })
  }
}
