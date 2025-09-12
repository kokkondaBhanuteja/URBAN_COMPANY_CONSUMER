import { type NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import { getServiceCategories } from "@/services/consumer/serviceDiscoveryService";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    // Pass the location to the service layer
    const categories = await getServiceCategories(location || undefined);

    // Transform to match frontend interface
    const transformedCategories = categories.map((category) => ({
      id: category._id.toString(),
      slug: category.categoryName.toLowerCase().replace(/\s+/g, "-"),
      title: category.categoryName,
      image:
        category.imageUrl ||
        `/placeholder.svg?height=160&width=160&query=${encodeURIComponent(
          category.categoryName + " service icon"
        )}`,
      description: category.description,
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}