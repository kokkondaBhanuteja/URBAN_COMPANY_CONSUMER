import { type NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip;
    
    // Use a free IP geolocation service (e.g., ip-api.com)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    
    if (!response.ok) {
      throw new Error(`IP API failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === "success") {
      logger.info("Detected Location:", { city: data.city, region: data.regionName });
      return NextResponse.json({ city: data.city, region: data.regionName });
    }
    
    // Fallback to a default location if detection fails
    logger.warn("IP Geolocation failed, falling back to default.");
    return NextResponse.json({ city: "Hanamkonda", region: "Telangana" });
  } catch (error) {
    logger.error("IP Geolocation Error:", error);
    // Fallback to a default location on error
    return NextResponse.json({ city: "Hanamkonda", region: "Telangana" });
  }
}