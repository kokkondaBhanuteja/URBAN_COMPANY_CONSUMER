import { type NextRequest, NextResponse } from "next/server"
import { getServiceDetails } from "@/services/consumer/serviceDiscoveryService"
import { connectDb } from "@/lib/dbConnect"

export async function GET(req: NextRequest, { params }: { params: { serviceId: string } }) {
  await connectDb()

  try {
    const { searchParams } = new URL(req.url)
    const location = searchParams.get("location")

    const serviceDetails = await getServiceDetails(params.serviceId, location || undefined)
    return NextResponse.json(serviceDetails)
  } catch (error: any) {
    console.error("Service details fetch error:", error)
    return NextResponse.json({ message: error.message || "Service not found" }, { status: 404 })
  }
}
