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

    let excludedProviderIds: string[] = [];
    
    // CORRECTED: Safely parse the JSON body
    // This try-catch block prevents an error if the request has no body.
    try {
      const body = await req.json();
      // If the body exists and has our property, use it. Otherwise, default to an empty array.
      excludedProviderIds = body.excludedProviderIds || [];
    } catch (error) {
      // This error is expected if the body is empty. We can safely ignore it
      // and proceed with the default empty excludedProviderIds array.
    }

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