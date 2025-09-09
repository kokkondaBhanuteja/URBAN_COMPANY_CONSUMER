import mongoose from "mongoose"
import "./../database/userModel"
import "./../database/ProviderModel"
import "./../database/serviceCategoryModel"
import "./../database/serviceModel"
import "./../database/bookingModel"
import "./../database/reviewModel"
import "./../database/paymentModel"
import "./../database/discountModel"
import "./../database/addressmodel"
import "./../database/providerPayoutModel"
import "./../database/consumerModel"

const MONGODB_URL = process.env.MONGODB_URI || "mongodb://localhost:27017"

if (!MONGODB_URL) {
  console.log("Please specify the URI in the Environment Variables.")
}

export const connectDb = async (): Promise<void> => {
  try {
    // console.log("Before", mongoose.connection.readyState);
    if (mongoose.connection.readyState === 1) {
      console.log("Db is already Connected, skipping")
      return
    }
    await mongoose.connect(MONGODB_URL, {
      dbName: "URBAN_COMPANY",
    })
    console.log("mongoDb is successfully Connected!")
  } catch (err) {
    console.log("Failed to connect to MongoDB ", err)
    process.exit(1)
  }
}
