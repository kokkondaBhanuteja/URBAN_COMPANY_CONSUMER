import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // We get the user's IP from the request headers.
    const ip = req.headers.get("x-forwarded-for") || req.ip;

    // Use a free IP geolocation service (e.g., ip-api.com)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    
    if (!response.ok) {
      throw new Error(`IP API failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("Detected Location:", data.city, data.regionName);
    if (data.status === "success") {
      console.log("Detected Location:", data.city, data.regionName);
      return NextResponse.json({ city: data.city, region: data.regionName });
    }
    // Fallback to a default location if detection fails
    return NextResponse.json({ city: "Hanamkonda", region: "Telangana" });
  } catch (error) {
    console.error("IP Geolocation Error:", error);
    // Fallback to a default location on error
    return NextResponse.json({ city: "Hanamkonda", region: "Telangana" });
  }
}