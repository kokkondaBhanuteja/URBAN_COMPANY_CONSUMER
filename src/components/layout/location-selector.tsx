"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, LocateFixed } from "lucide-react";
import { useLocation } from "@/lib/location-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LocationSelector() {
  const { location, setLocation, loading, detectLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsFetchingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${searchQuery}&format=json&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Nominatim search error:", error);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    if (isFocused) {
      fetchSuggestions();
    }
  }, [searchQuery, isFocused]);

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
    setIsFocused(false);
  };

  const handleDetectLocation = () => {
    detectLocation();
    setIsFocused(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center pl-3 pr-2 border-r">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Location"
          value={isFocused ? searchQuery : loading ? "Detecting..." : location?.city || ""}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-32 text-sm"
        />
      </div>
      {isFocused && (
        <div className="absolute top-full mt-2 w-72 bg-white border rounded-lg shadow-lg z-10 p-2">
          <Button variant="ghost" className="w-full justify-start" onClick={handleDetectLocation}>
            <LocateFixed className="h-4 w-4 mr-2" />
            Detect my location
          </Button>
          {isFetchingSuggestions && <div className="p-2 text-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            Searching...
            </div>}
          {suggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              {suggestions.map((item) => (
                <div
                  key={item.place_id}
                  onClick={() => handleSelectLocation(item)}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                >
                  <p className="font-semibold">{item.address.city || item.address.town || item.address.village}</p>
                  <p className="text-sm text-muted-foreground">{item.display_name}</p>
                </div>
              ))}
            </div>
          )}
          {searchQuery.length > 1 && !isFetchingSuggestions && suggestions.length === 0 && (
            <p className="p-2 text-center text-sm text-muted-foreground">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}