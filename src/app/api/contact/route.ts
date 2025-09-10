import { type NextRequest, NextResponse } from "next/server";
import { sendContactMessage } from "@/services/contactService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await sendContactMessage({ name, email, phone, message });

    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}