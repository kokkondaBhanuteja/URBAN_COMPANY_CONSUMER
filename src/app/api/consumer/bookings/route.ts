import { type NextRequest, NextResponse } from "next/server"
import { consumerMiddleware } from "@/middlewares/consumerMiddleware"
import Booking from "@/database/bookingModel"
import { connectDb } from "@/lib/dbConnect"
import { Types } from "mongoose"

export async function GET(req: NextRequest) {
  await connectDb()

  try {
    // Correctly handle the middleware response, just like in your profile route
    const middlewareResponse = await consumerMiddleware(req)
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found in headers" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // FIX: Use the correct field name 'userId' from your bookingModel
    const query: any = { userId: new Types.ObjectId(userId) }
    if (status) {
      query.bookingStatus = status
    }

    const bookings = await Booking.find(query)
      .populate("serviceId", "serviceName basePrice")
      .populate({
        path: 'providerId',
        populate: {
           path: 'userId',
           select: 'userName' 
        }
      })
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
    // Correctly handle the middleware response
    const middlewareResponse = await consumerMiddleware(req)
     if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found in headers" }, { status: 401 })
    }

    const bookingData = await req.json()

    // FIX: Use the correct field name 'userId' from your bookingModel
    const booking = new Booking({
      userId: new Types.ObjectId(userId),
      serviceId: new Types.ObjectId(bookingData.serviceId),
      serviceAddress: bookingData.serviceAddress,
      scheduledAt: new Date(bookingData.scheduledAt),
      // Assuming 'pricing' is part of your model based on bookingModel.ts
      pricing: {
        basePrice: bookingData.totalPrice, // Or calculate as needed
        finalAmount: bookingData.totalPrice,
      },
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