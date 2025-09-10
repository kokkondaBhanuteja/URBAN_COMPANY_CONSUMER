import { NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { getServiceCategories } from "@/services/consumer/serviceDiscoveryService"

export async function GET() {
  try {
    await connectDb()
    const categories = await getServiceCategories()
    console.log("Raw categories from DB:", categories);
    // Transform to match frontend interface
    const transformedCategories = categories.map((category) => ({
      id: category._id.toString(),
      slug: category.categoryName.toLowerCase().replace(/\s+/g, "-"),
      title: category.categoryName,
      image:
        category.imageUrl || // Corrected from iconUrl to imageUrl
        `/placeholder.svg?height=160&width=160&query=${encodeURIComponent(category.categoryName + " service icon")}`,
      description: category.description,
    }))

    console.log("Fetched categories:", transformedCategories);
    
    return NextResponse.json(transformedCategories)
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
  }
}
