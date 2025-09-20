import { type NextRequest, NextResponse } from "next/server";
import {
  getServiceCategories,
  getServicesByCategory,
  searchServices,
  searchServicesByLocation,
} from "@/services/consumer/serviceDiscoveryService";
import { connectDb } from "@/lib/dbConnect";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  await connectDb();
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const query = searchParams.get("query");
    const location = searchParams.get("location");

    if (location && !query && !categoryId) {
      const services = await searchServicesByLocation(location);
      return NextResponse.json({ services });
    } else if (query) {
      const services = await searchServices(query, location || undefined);
      return NextResponse.json({ services });
    } else if (categoryId) {
      const services = await getServicesByCategory(categoryId, location || undefined);
      return NextResponse.json({ services });
    } else {
      const categories = await getServiceCategories();
      return NextResponse.json({ categories });
    }
  } catch (error: any) {
    logger.error("All services fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching services" },
      { status: 500 }
    );
  }
}