import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import Booking from "@/database/bookingModel";
import Consumer from "@/database/consumerModel";
import { connectDb } from "@/lib/dbConnect";
import { Types, startSession } from "mongoose";
import { nanoid } from "nanoid";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in headers" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate("serviceId", "serviceName basePrice")
      .populate({
        path: "providerId",
        populate: {
          path: "userId",
          select: "userName",
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error("Bookings fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connectDb();
  const session = await startSession();
  session.startTransaction();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in headers" },
        { status: 401 }
      );
    }

    const { services, serviceAddress, scheduledAt, specialInstructions } =
      await req.json();

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { message: "An array of services is required." },
        { status: 400 }
      );
    }

    const orderId = nanoid();
    const createdBookings = [];

    for (const service of services) {
      const booking = new Booking({
        orderId,
        userId: new Types.ObjectId(userId),
        serviceId: new Types.ObjectId(service.serviceId),
        serviceAddress,
        scheduledAt: new Date(scheduledAt),
        pricing: {
          basePrice: service.totalPrice,
          finalAmount: service.totalPrice,
        },
        specialInstructions,
      });
      const savedBooking = await booking.save({ session });
      createdBookings.push(savedBooking);
    }

    // Increment the totalBookings count for the consumer
    await Consumer.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $inc: { totalBookings: createdBookings.length } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message: "Bookings created successfully",
        orderId,
        bookingIds: createdBookings.map((b) => b._id),
      },
      { status: 201 }
    );
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Booking creation error:", error);
    return NextResponse.json(
      {
        message: error.message || "An error occurred while creating booking",
      },
      { status: 500 }
    );
  }
}