import { type NextRequest, NextResponse } from "next/server"
import { consumerMiddleware } from "@/middlewares/consumerMiddleware"
import { connectDb } from "@/lib/dbConnect"
import Address from "@/database/addressmodel"
import { Types } from "mongoose"

async function authorize(req: NextRequest, addressId: string) {
  const middlewareResponse = await consumerMiddleware(req)
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse
  }
  const userId = middlewareResponse.get("x-user-id")

  if (!userId) {
    return NextResponse.json({ message: "User ID not found" }, { status: 401 })
  }

  const address = await Address.findById(addressId)

  if (!address) {
    return NextResponse.json({ message: "Address not found" }, { status: 404 })
  }

  if (address.userId.toString() !== userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  return { userId, address }
}

// UPDATE an address
export async function PUT(req: NextRequest, { params }: { params: { addressId: string } }) {
  await connectDb()
  try {
    const authResult = await authorize(req, params.addressId)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await req.json()
    const { addressLine1, city, pincode, state, addressType } = body

    const updatedAddress = await Address.findByIdAndUpdate(
      params.addressId,
      { addressLine1, city, pincode, state, addressType },
      { new: true },
    )

    return NextResponse.json(updatedAddress)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update address" }, { status: 500 })
  }
}

// DELETE an address
export async function DELETE(req: NextRequest, { params }: { params: { addressId: string } }) {
  await connectDb()
  try {
    const authResult = await authorize(req, params.addressId)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    await Address.findByIdAndDelete(params.addressId)

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete address" }, { status: 500 })
  }
}