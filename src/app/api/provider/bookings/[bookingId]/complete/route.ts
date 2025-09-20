import { type NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import logger from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  await connectDb();
  try {
    const bookingId = params.bookingId;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "completed",
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    logger.error("Booking completion error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to complete booking" },
      { status: 500 }
    );
  }
}