import { type NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { getServicesByCategory, searchServices, searchServicesByLocation } from "@/services/consumer/serviceDiscoveryService"
import ServiceCategory from "@/database/serviceCategoryModel"

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get("category")
    const query = searchParams.get("q")
    const location = searchParams.get("location")

    let services: any[] = []

    if (location && !query && !categorySlug) {
      services = await searchServicesByLocation(location)
    } else if (query) {
      services = await searchServices(query, location || undefined)
    } else if (categorySlug) {
      const category = await ServiceCategory.findOne({
        // A more robust regex to handle slugs like 'ac-service-repair'
        categoryName: { $regex: new RegExp(`^${categorySlug.replace(/-/g, " ")}$`, "i") },
        isActive: true,
      })

      if (category) {
        services = await getServicesByCategory(category._id.toString(), location || undefined)
      }
    } else {
      // Fallback: If no specific query, we can decide to return nothing or popular services.
      // For now, returning an empty array is safer than returning everything.
      services = []
    }

    // Transform the raw service data to match the frontend 'Service' interface
    const transformedServices = services.map((service) => ({
      id: service._id.toString(),
      slug: service.slug || service.serviceName.toLowerCase().replace(/\s+/g, "-"),
      categorySlug: service.category?.categoryName?.toLowerCase().replace(/\s+/g, "-") || "general",
      title: service.serviceName,
      city: location || "Available",
      rating: 4.5, // Placeholder: Replace with actual calculated rating
      ratingCount: 150, // Placeholder: Replace with actual review count
      images: [
        service.imageUrl ||
          `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(service.serviceName)}`,
      ],
      options: [
        {
          id: service._id.toString(),
          title: service.serviceName,
          priceSubunits: (service.basePrice || 0) * 100,
        },
      ],
      summary: service.description,
    }))

    return NextResponse.json(transformedServices)
  } catch (error) {
    console.error("Services API Error:", error)
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 })
  }
}