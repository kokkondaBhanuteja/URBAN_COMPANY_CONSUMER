import { type NextRequest, NextResponse } from "next/server";
import { getServiceAvailability } from "@/services/consumer/serviceDiscoveryService";
import { connectDb } from "@/lib/dbConnect";

export async function GET(req: NextRequest, { params }: { params: { serviceId: string } }) {
  await connectDb();

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const location = searchParams.get("location");

    if (!date) {
        return NextResponse.json({ message: "Date parameter is required" }, { status: 400 });
    }

    const availability = await getServiceAvailability(params.serviceId, date, location || undefined);
    return NextResponse.json(availability);
  } catch (error: any) {
    console.error("Service availability fetch error:", error);
    return NextResponse.json({ message: error.message || "An error occurred while fetching availability" }, { status: 500 });
  }
}