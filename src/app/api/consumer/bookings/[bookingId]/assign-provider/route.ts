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

    const bookingId = params.bookingId;
    await assignProviderToBooking(bookingId);

    return NextResponse.json({ message: "Provider assigned successfully" });
  } catch (error: any) {
    console.error("Provider assignment error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to assign provider" },
      { status: 500 }
    );
  }
}