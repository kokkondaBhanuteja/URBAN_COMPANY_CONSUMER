import { type NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import { createProviderPayout } from "@/services/payoutService";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";

export async function POST(req: NextRequest) {
    await connectDb();
    try {
        const middlewareResponse = await consumerMiddleware(req);
        if (middlewareResponse instanceof NextResponse) {
            return middlewareResponse;
        }

        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ message: "Booking ID is required" }, { status: 400 });
        }

        const payout = await createProviderPayout(bookingId);

        return NextResponse.json(payout, { status: 201 });
    } catch (error: any) {
        console.error("Payout creation error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to create payout" },
            { status: 500 }
        );
    }
}