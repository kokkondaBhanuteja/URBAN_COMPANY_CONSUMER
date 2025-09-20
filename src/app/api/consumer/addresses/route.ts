import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Address from "@/database/addressmodel";
import { Types } from "mongoose";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { addressLine1, city, pincode, state, addressType } = body;

    const newAddress = new Address({
      userId: new Types.ObjectId(userId),
      addressLine1,
      city,
      pincode,
      state,
      addressType,
      country: "India", 
    });

    await newAddress.save();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    logger.error("Address creation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create address" },
      { status: 500 }
    );
  }
}