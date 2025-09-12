import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import { assignProviderToBooking } from "@/services/consumer/providerAssignmentService";

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }

    const { excludedProviderIds } = await req.json();
    const bookingId = params.bookingId;
    const updatedBooking = await assignProviderToBooking(bookingId, excludedProviderIds);

    return NextResponse.json({ 
        message: "Provider assignment process completed.",
        providerId: updatedBooking?.providerId // Return the assigned provider's ID
    });
  } catch (error: any) {
    console.error("Provider assignment error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to assign provider" },
      { status: 500 }
    );
  }
}