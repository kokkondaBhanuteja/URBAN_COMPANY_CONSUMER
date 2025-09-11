import { type NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { getServicesByCategory, searchServices } from "@/services/consumer/serviceDiscoveryService"
import ServiceCategory from "@/database/serviceCategoryModel"

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get("category")
    const query = searchParams.get("q")
    const location = searchParams.get("location")

    let services = []

    if (query) {
      // Search services
      services = await searchServices(query, location || undefined)

    } else if (categorySlug) {
      // Get category by slug first
      const category = await ServiceCategory.findOne({
        categoryName: { $regex: new RegExp(categorySlug.replace("-", " "), "i") },
        isActive: true,
      })

      if (category) {
        services = await getServicesByCategory(category._id.toString(), location || undefined)
      }
    } else {
      const allCategories = await ServiceCategory.find({ isActive: true })
      const allServices = []

      for (const category of allCategories) {
        const categoryServices = await getServicesByCategory(category._id.toString(), location || undefined)
        allServices.push(...categoryServices)
      }

      services = allServices
    }

    console.log("Raw services from DB:", services)
    // Transform to match frontend interface
    const transformedServices = services.map((service) => ({
      id: service._id.toString(),
      slug: service.serviceName.toLowerCase().replace(/\s+/g, "-"),
      categorySlug: categorySlug || "general",
      title: service.serviceName,
      city: location || "Available",
      rating: 4.5, // You can calculate this from reviews
      ratingCount: 150, // You can calculate this from reviews
      images: [
        service.imageUrl || // Corrected from iconUrl to imageUrl
          `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(service.serviceName + " service")}`,
      ],
      options: [
        {
          id: service._id.toString(),
          title: service.serviceName,
          priceSubunits: service.basePrice * 100, // Convert to subunits (paise)
        },
      ],
      summary: service.description,
    }))
    
    console.log("Transformed Services: ",transformedServices);

    return NextResponse.json(transformedServices)
  } catch (error) {
    console.error("Services fetch error:", error)
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 })
  }
}