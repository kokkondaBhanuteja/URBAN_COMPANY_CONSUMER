"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useLocation } from "@/lib/location-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LocationSelector() {
  const { location, setLocation, loading } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${query}&format=json&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Nominatim search error:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectLocation = (selectedLocation: any) => {
    setLocation({
      city:
        selectedLocation.address.city ||
        selectedLocation.address.town ||
        selectedLocation.address.village,
      region: selectedLocation.address.state,
    });
    setSearchQuery("");
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <div className="flex items-center pl-3 pr-2 border-r">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Location"
          value={searchQuery || (loading ? "Detecting..." : location?.city || "")}
          onChange={(e) => handleSearch(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-32 text-sm"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
          {suggestions.map((item) => (
            <div
              key={item.place_id}
              onClick={() => handleSelectLocation(item)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}