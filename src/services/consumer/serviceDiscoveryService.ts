import Service from "@/database/serviceModel"
import ServiceCategory from "@/database/serviceCategoryModel"
import Provider from "@/database/ProviderModel"
import { Types } from "mongoose"

// Get all active service categories
export const getServiceCategories = async () => {
  return ServiceCategory.find({ isActive: true }).sort({ categoryName: 1 })
}

// Get services by category
export const getServicesByCategory = async (categoryId: string, location?: string) => {
  const services = await Service.find({
    category: new Types.ObjectId(categoryId),
    isActive: true,
  })
    .populate("category", "categoryName iconUrl")
    .sort({ serviceName: 1 })

  // If location is provided, filter by providers available in that location
  if (location) {
    const serviceIds = services.map((service) => service._id)
    const availableProviders = await Provider.find({
      servicesOffered: { $in: serviceIds },
      serviceableLocations: { $regex: location, $options: "i" },
      isActive: true,
      isVerified: true,
    })

    const availableServiceIds = new Set()
    availableProviders.forEach((provider) => {
      provider.servicesOffered.forEach((serviceId) => {
        if (serviceIds.some((id) => id.equals(serviceId))) {
          availableServiceIds.add(serviceId.toString())
        }
      })
    })

    return services.filter((service) => availableServiceIds.has(service._id.toString()))
  }

  return services
}

// Search services
export const searchServices = async (query: string, location?: string) => {
  const searchRegex = new RegExp(query, "i")

  const services = await Service.find({
    $or: [{ serviceName: searchRegex }, { description: searchRegex }],
    isActive: true,
  })
    .populate("category", "categoryName iconUrl")
    .sort({ serviceName: 1 })

  // Apply location filter if provided
  if (location) {
    const serviceIds = services.map((service) => service._id)
    const availableProviders = await Provider.find({
      servicesOffered: { $in: serviceIds },
      serviceableLocations: { $regex: location, $options: "i" },
      isActive: true,
      isVerified: true,
    })

    const availableServiceIds = new Set()
    availableProviders.forEach((provider) => {
      provider.servicesOffered.forEach((serviceId) => {
        if (serviceIds.some((id) => id.equals(serviceId))) {
          availableServiceIds.add(serviceId.toString())
        }
      })
    })

    return services.filter((service) => availableServiceIds.has(service._id.toString()))
  }

  return services
}

// Get service details with available providers
export const getServiceDetails = async (serviceId: string, location?: string) => {
  const service = await Service.findById(serviceId).populate("category", "categoryName iconUrl")

  if (!service) throw new Error("Service not found")

  // Get providers offering this service
  const providersQuery: any = {
    servicesOffered: new Types.ObjectId(serviceId),
    isActive: true,
    isVerified: true,
  }

  if (location) {
    providersQuery.serviceableLocations = { $regex: location, $options: "i" }
  }

  const providers = await Provider.find(providersQuery)
    .populate("userId", "userName")
    .sort({ averageRating: -1 })
    .limit(10)

  return {
    service,
    providers,
  }
}
