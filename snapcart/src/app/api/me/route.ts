import { auth } from "@/auth";
import User from "@/models/user.models";
import connectDB from "@/lib/db"; 
import { NextResponse } from "next/server";

export async function GET(req: NextResponse) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "User is not authenticated" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email }).select(
      "-password"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get me error: ${error}` },
      { status: 500 }
    );
  }
}