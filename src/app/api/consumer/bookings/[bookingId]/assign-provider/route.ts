import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import { assignProviderToBooking } from "@/services/consumer/providerAssignmentService";
import logger from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }

    let excludedProviderIds: string[] = [];

    try {
      const body = await req.json();
      excludedProviderIds = body.excludedProviderIds || [];
    } catch (error) {
      // Safely ignore empty body
    }

    const bookingId = params.bookingId;
    const updatedBooking = await assignProviderToBooking(
      bookingId,
      excludedProviderIds
    );

    return NextResponse.json({
      message: "Provider assignment process completed.",
      providerId: updatedBooking?.providerId,
    });
  } catch (error: any) {
    logger.error("Provider assignment error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to assign provider" },
      { status: 500 }
    );
  }
}