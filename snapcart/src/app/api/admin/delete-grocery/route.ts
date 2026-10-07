import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "you are not an admin" },
        { status: 403 },
      );
    }

    const { groceryId } = await req.json();

    if (!groceryId) {
      return NextResponse.json(
        { message: "groceryId is required" },
        { status: 400 },
      );
    }

    const grocery = await Grocery.findByIdAndDelete(groceryId);

    if (!grocery) {
      return NextResponse.json(
        { message: "grocery not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "grocery deleted", groceryId },
      { status: 200 },
    );
  } catch (error) {
    console.error("delete grocery error", error);
    return NextResponse.json(
      { message: "delete grocery error" },
      { status: 500 },
    );
  }
}