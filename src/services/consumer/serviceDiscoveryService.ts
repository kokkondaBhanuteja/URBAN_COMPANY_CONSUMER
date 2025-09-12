import Service from "@/database/serviceModel"
import ServiceCategory from "@/database/serviceCategoryModel"
import Provider from "@/database/ProviderModel"
import Booking from "@/database/bookingModel"
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

// Get service availability
export const getServiceAvailability = async (serviceId: string, date: string, location?: string) => {
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new Error("Service not found");
    }

    const providersQuery: any = {
        servicesOffered: new Types.ObjectId(serviceId),
        isActive: true,
        isVerified: true,
    };

    if (location) {
        providersQuery.serviceableLocations = { $regex: new RegExp(location, "i") };
    }

    const providers = await Provider.find(providersQuery);
    if (providers.length === 0) {
        return [];
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // Sunday - 0, Monday - 1, etc.

    const allTimeSlots = generateTimeSlots("09:00", "17:00", 30);
    const providerAvailability = new Map<string, boolean>();

    for (const slot of allTimeSlots) {
        providerAvailability.set(slot, false);
    }

    for (const provider of providers) {
        const bookings = await Booking.find({
            providerId: provider._id,
            scheduledAt: {
                $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
            },
        });

        const bookedSlots = new Set(
            bookings.map(b =>
                new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            )
        );


        for (const slot of allTimeSlots) {
            if (!bookedSlots.has(slot)) {
                providerAvailability.set(slot, true);
            }
        }
    }

    const availableSlots = Array.from(providerAvailability.entries())
        .filter(([, isAvailable]) => isAvailable)
        .map(([slot]) => slot);

    return availableSlots;
};

function generateTimeSlots(start: string, end: string, interval: number): string[] {
    const slots = [];
    let [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime <= endTime) {
        slots.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    return slots;
}