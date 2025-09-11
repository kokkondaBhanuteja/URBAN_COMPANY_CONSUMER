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
      serviceableLocations: { $regex: new RegExp(location, "i") },
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

// Search services by query
export const searchServices = async (query: string, location?: string) => {
    // Use a text search query
    const services = await Service.find(
        { 
            $text: { $search: query },
            isActive: true 
        },
        { 
            score: { $meta: "textScore" } 
        }
    )
    .populate("category", "categoryName iconUrl")
    .sort({ score: { $meta: "textScore" } });

    // Apply location filter if provided
    if (location) {
        const serviceIds = services.map((service) => service._id);
        const availableProviders = await Provider.find({
            servicesOffered: { $in: serviceIds },
            serviceableLocations: { $regex: new RegExp(location, "i") },
            isActive: true,
            isVerified: true,
        });

        const availableServiceIds = new Set(
            availableProviders.flatMap(provider => 
                provider.servicesOffered.map(id => id.toString())
            )
        );

        return services.filter((service) => availableServiceIds.has(service._id.toString()));
    }

    return services;
};

// Search services by location
export const searchServicesByLocation = async (location: string) => {
  const providers = await Provider.find({
    serviceableLocations: { $regex: new RegExp(location, "i") },
    isActive: true,
    isVerified: true,
  }).populate({
    path: "servicesOffered",
    match: { isActive: true },
    populate: {
      path: "category",
      select: "categoryName iconUrl",
    },
  });

  const services = providers.flatMap(provider => provider.servicesOffered);
  
  // Deduplicate services
  const uniqueServices = Array.from(new Map(services.map(service => [service._id.toString(), service])).values());

  return uniqueServices;
};


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