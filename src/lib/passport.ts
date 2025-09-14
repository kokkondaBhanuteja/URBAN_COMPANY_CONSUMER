import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "@/database/userModel"
import Consumer from "@/database/consumerModel"
import Wallet from "@/database/walletModel" // Import the Wallet model
import { connectDb } from "@/lib/dbConnect"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await connectDb()

        let user = await User.findOne({ googleId: profile.id })

        if (user) {
          return done(null, user)
        }

        user = await User.findOne({ email: profile.emails?.[0].value })

        if (user) {
          user.googleId = profile.id
          user.isVerified = true
          await user.save()
          return done(null, user)
        }

        const newUser = new User({
          googleId: profile.id,
          userName: profile.displayName || profile.emails?.[0].value?.split("@")[0] || "Google User",
          email: profile.emails?.[0].value,
          userType: "consumer",
          isVerified: true, // Google email is already verified
          // No mobileNumber is provided here
        })
        await newUser.save()

        // Create a wallet for the new user
        const newWallet = new Wallet({
          userId: newUser._id,
          balance: 0,
        });
        await newWallet.save();


        const newConsumer = new Consumer({
          userId: newUser._id,
          walletId: newWallet._id, // Assign the new wallet's ID
        })
        await newConsumer.save()

        return done(null, newUser)
      } catch (error) {
        console.error("Google OAuth error:", error)
        return done(error, false)
      }
    },
  ),
)

export default passport