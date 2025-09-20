import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Review from "@/database/reviewModel";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import { Types, startSession } from "mongoose";
import logger from "@/lib/logger";

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
        { message: "User ID not found" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, rating, comment } = body;

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const newReview = new Review({
      bookingId: new Types.ObjectId(bookingId),
      consumerId: new Types.ObjectId(userId),
      providerId: booking.providerId,
      rating,
      comment,
    });

    await newReview.save({ session });

    // Update provider's average rating
    const reviews = await Review.find({ providerId: booking.providerId }).session(session);
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Provider.findByIdAndUpdate(booking.providerId, { averageRating }, { session });
    
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Review creation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}