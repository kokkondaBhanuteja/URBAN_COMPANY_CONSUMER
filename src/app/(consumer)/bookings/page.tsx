"use client"

import { useQuery } from "@tanstack/react-query"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { AuthGuard } from "@/components/consumer/auth-guard"
import { RecentBookings } from "@/components/consumer/recent-bookings"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

const fetchBookings = async () => {
  // ✨ MODIFIED: Added '?limit=100' to fetch up to 100 bookings.
  const response = await fetch("/api/consumer/bookings?limit=100", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  const data = await response.json();
  return data.bookings;
};

export default function BookingsPage() {
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['allBookings'],
    queryFn: fetchBookings,
  });

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AuthGuard>
            <h1 className="text-3xl font-bold text-foreground mb-8">My Bookings</h1>
            {isLoading && (
              <div className="space-y-6">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Could not load your bookings. Please try again later.
                </AlertDescription>
              </Alert>
            )}
            {bookings && <RecentBookings bookings={bookings} />}
          </AuthGuard>
        </div>
      </main>
      <Footer />
    </div>
  )
}