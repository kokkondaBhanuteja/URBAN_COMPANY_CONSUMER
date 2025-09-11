import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import { IBooking } from "@/database/bookingModel";
import { IProvider } from "@/database/ProviderModel";
import { Types } from "mongoose";

/**
 * Finds providers who are available for a given booking.
 * @param booking The booking to find providers for.
 * @returns A promise that resolves to an array of available providers.
 */
async function findAvailableProviders(booking: IBooking): Promise<IProvider[]> {
    const { serviceId, serviceAddress, scheduledAt } = booking;

    // Step 1: Initial Filtering (Service, Location, Active Status)
    const potentialProviders = await Provider.find({
        servicesOffered: serviceId,
        serviceableLocations: { $regex: new RegExp(serviceAddress.city, "i") },
        isActive: true,
        isVerified: true,
    });

    // Step 2: Availability Check (Schedule and Conflicting Bookings)
    const availableProviders = [];
    for (const provider of potentialProviders) {
        // Check against the provider's general availability
        const isAvailableInSchedule = provider.availability.some(slot => 
            !slot.isUnavailable && scheduledAt >= slot.startTime && scheduledAt <= slot.endTime
        );

        if (!isAvailableInSchedule) continue;

        // Check for conflicting bookings around the same time (e.g., within a 2-hour window)
        const conflictingBooking = await Booking.findOne({
            providerId: provider._id,
            bookingStatus: { $in: ["assigned", "confirmed", "in_progress"] },
            scheduledAt: {
                $gte: new Date(scheduledAt.getTime() - 60 * 60 * 1000), // 1 hour before
                $lt: new Date(scheduledAt.getTime() + 60 * 60 * 1000)   // 1 hour after
            }
        });

        if (!conflictingBooking) {
            availableProviders.push(provider);
        }
    }

    return availableProviders;
}

/**
 * Ranks a list of providers based on rating and workload.
 * @param providers The list of providers to rank.
 * @returns A promise that resolves to a sorted array of providers.
 */
async function rankProviders(providers: IProvider[]): Promise<IProvider[]> {
    const providersWithWorkload = await Promise.all(providers.map(async (provider) => {
        const upcomingBookings = await Booking.countDocuments({
            providerId: provider._id,
            bookingStatus: { $in: ["assigned", "confirmed"] },
            scheduledAt: { $gte: new Date() }
        });
        return { ...provider.toObject(), upcomingBookings };
    }));

    providersWithWorkload.sort((a, b) => {
        // Rank by average rating first (descending)
        if (a.averageRating !== b.averageRating) {
            return b.averageRating - a.averageRating;
        }
        // Then, by workload (ascending)
        return a.upcomingBookings - b.upcomingBookings;
    });

    return providersWithWorkload.map(p => new Provider(p));
}

/**
 * Main function to assign a provider to a booking.
 * @param bookingId The ID of the booking to assign.
 */
export async function assignProviderToBooking(bookingId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking || booking.bookingStatus !== 'requested') {
        throw new Error("Booking not found or is not in a 'requested' state.");
    }

    const availableProviders = await findAvailableProviders(booking);

    if (availableProviders.length === 0) {
        console.warn(`No available providers found for booking: ${bookingId}`);
        // Here you could add logic to flag this booking for manual assignment
        return;
    }

    const rankedProviders = await rankProviders(availableProviders);
    const bestProvider = rankedProviders[0];

    // Assign the top-ranked provider to the booking
    booking.providerId = bestProvider._id;
    booking.bookingStatus = 'assigned';
    await booking.save();

    console.log(`Successfully assigned provider ${bestProvider._id} to booking ${bookingId}`);
    
    // You can add a notification call to the provider here

    return booking;
}