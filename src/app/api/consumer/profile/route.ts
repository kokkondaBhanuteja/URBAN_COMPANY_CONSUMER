import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import {
  getConsumerProfile,
  updateConsumerProfile,
} from "@/services/consumer/consumerService";
import { connectDb } from "@/lib/dbConnect";
import User from "@/database/userModel";
import Consumer from "@/database/consumerModel";
import logger from "@/lib/logger";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
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

    const profile = await getConsumerProfile(userId);

    if (!profile.consumer) {
      return NextResponse.json(
        { message: "Consumer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    logger.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await connectDb();
  const session = await mongoose.startSession();
  session.startTransaction();
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

    const updateData = await req.json();

    // Update User model
    await User.findByIdAndUpdate(
      userId,
      { userName: updateData.userName },
      { session }
    );

    // Update Consumer address
    await Consumer.findOneAndUpdate(
      { userId },
      {
        $set: {
          "address.addressLine1": updateData.addressLine1,
          "address.city": updateData.city,
          "address.pincode": updateData.pincode,
          "address.state": updateData.state,
        },
      },
      { session }
    );

    const updatedProfile = await getConsumerProfile(userId);

    if (!updatedProfile) {
      return NextResponse.json(
        { message: "Consumer profile not found" },
        { status: 404 }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Profile update error:", error);
    return NextResponse.json(
      {
        message: error.message || "An error occurred while updating profile",
      },
      { status: 500 }
    );
  }
}