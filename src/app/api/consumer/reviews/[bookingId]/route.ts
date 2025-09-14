import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Review from "@/database/reviewModel";
import { Types } from "mongoose";

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

    const review = await Review.findOne({ 
      bookingId: new Types.ObjectId(params.bookingId),
      consumerId: new Types.ObjectId(userId) 
    });

    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Review fetch error:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch review" }, { status: 500 });
  }
}