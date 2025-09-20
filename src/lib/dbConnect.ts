import mongoose from "mongoose";
import logger from "./logger";
import "./../database/userModel";
import "./../database/ProviderModel";
import "./../database/serviceCategoryModel";
import "./../database/serviceModel";
import "./../database/bookingModel";
import "./../database/reviewModel";
import "./../database/paymentModel";
import "./../database/discountModel";
import "./../database/addressmodel";
import "./../database/providerPayoutModel";
import "./../database/consumerModel";

const MONGODB_URL = process.env.MONGODB_URI || "mongodb://localhost:27017";

if (!MONGODB_URL) {
  logger.error("Please specify the URI in the Environment Variables.");
}

export const connectDb = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    await mongoose.connect(MONGODB_URL, {
      dbName: "URBAN_COMPANY",
    });
    logger.info("mongoDb is successfully Connected!");
  } catch (err) {
    logger.error("Failed to connect to MongoDB ", err);
    process.exit(1);
  }
};