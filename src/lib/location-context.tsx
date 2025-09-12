"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { getStorageItem, setStorageItem } from "./storage";

interface Location {
  city: string;
  region: string;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  loading: boolean;
  detectLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    setStorageItem("user-location", newLocation);
  }

  const fetchIpBasedLocation = async () => {
    try {
      const response = await fetch("/api/location");
      const data = await response.json();
      setLocation(data);
    } catch (error) {
      console.error("Failed to fetch IP-based location:", error);
      setLocation({ city: "Hanamkonda", region: "Telangana" });
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village;
            const region = data.address.state;

            setLocation({ city, region });
            setLoading(false);
          } catch (error) {
            console.error("Reverse geocoding failed, using fallback:", error);
            fetchIpBasedLocation();
          }
        },
        (error) => {
          console.warn(`Geolocation error (${error.code}): ${error.message}. Using fallback.`);
          fetchIpBasedLocation();
        }
      );
    } else {
      console.log("Browser does not support geolocation. Using fallback.");
      fetchIpBasedLocation();
    }
  }

  useEffect(() => {
    const savedLocation = getStorageItem<Location | null>("user-location", null);
    if (savedLocation) {
      setLocationState(savedLocation);
      setLoading(false);
    } else {
      detectLocation();
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, loading, detectLocation }}>
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