import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/database/userModel";
import logger from "@/lib/logger";

export async function consumerMiddleware(req: NextRequest): Promise<NextResponse | Headers> {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    logger.warn("Middleware Error: Authorization token is missing.", { path: req.nextUrl.pathname });
    return new NextResponse(JSON.stringify({ message: "Authorization token is missing" }), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      userType: string;
    };

    if (decoded.userType !== "consumer") {
      logger.warn(`Middleware Error: Access denied for userType: ${decoded.userType}`, { userId: decoded.id });
      return new NextResponse(JSON.stringify({ message: "Access denied: Not a consumer" }), { status: 403 });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      logger.error(`Middleware Error: User not found for decoded ID: ${decoded.id}`);
      return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user._id.toString());
    requestHeaders.set("x-user-type", user.userType);

    return requestHeaders;
  } catch (error: any) {
    logger.error("Middleware JWT Verification Error:", { error: error.message });
    if (!process.env.JWT_SECRET) {
        logger.error("CRITICAL: JWT_SECRET environment variable is not set!");
    }
    return new NextResponse(JSON.stringify({ message: `Invalid or expired token: ${error.message}` }), { status: 401 });
  }
}