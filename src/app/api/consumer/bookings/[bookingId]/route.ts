import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import { Types } from "mongoose";
import logger from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: { bookingId: string } }) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 });
    }

    const booking = await Booking.findOne({
      _id: new Types.ObjectId(params.bookingId),
      userId: new Types.ObjectId(userId),
    }).populate("serviceId", "serviceName");

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    logger.error("Single booking fetch error:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch booking" }, { status: 500 });
  }
}