import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import User from "@/database/userModel"

export async function consumerMiddleware(req: NextRequest): Promise<Headers> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization token is missing")
  }

  try {
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; userType: string }

    if (decoded.userType !== "consumer") {
      throw new Error("Access denied: Not a consumer")
    }

    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      throw new Error("User not found")
    }

    // Create new headers and add the user ID
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", user._id.toString())
    requestHeaders.set("x-user-type", user.userType)

    // Return the new headers
    return requestHeaders
  } catch (error) {
    // Re-throw the error to be caught by the API route
    throw new Error("Invalid or expired token")
  }
}