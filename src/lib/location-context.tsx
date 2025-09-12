"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface Location {
  city: string;
  region: string;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Define the IP-based fallback function
    const fetchIpBasedLocation = async () => {
      try {
        const response = await fetch("/api/location");
        const data = await response.json();
        console.log("Using fallback IP-based location:", data);
        setLocation(data);
      } catch (error) {
        console.error("Failed to fetch IP-based location:", error);
        // Final fallback to a default location
        setLocation({ city: "Hanamkonda", region: "Telangana" });
      } finally {
        setLoading(false);
      }
    };

    // 2. Try to use the browser's highly accurate Geolocation API first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use a reverse geocoding service to get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village;
            const region = data.address.state;

            console.log("Detected location via Geolocation API:", { city, region });
            setLocation({ city, region });
            setLoading(false);
          } catch (error) {
            console.error("Reverse geocoding failed, using fallback:", error);
            fetchIpBasedLocation();
          }
        },
        (error) => {
          // This block runs if the user denies permission
          console.warn(`Geolocation error (${error.code}): ${error.message}. Using fallback.`);
          fetchIpBasedLocation();
        }
      );
    } else {
      // This block runs if the browser doesn't support Geolocation
      console.log("Browser does not support geolocation. Using fallback.");
      fetchIpBasedLocation();
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, loading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}