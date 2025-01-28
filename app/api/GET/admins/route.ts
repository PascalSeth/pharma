import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const admins = await prisma.admin.findMany(); // Adjust according to your database model
    console.log("Fetched admins:", admins);
    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}
