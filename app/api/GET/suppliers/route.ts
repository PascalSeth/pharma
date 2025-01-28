import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany(); // Adjust according to your database model
    console.log("Fetched suppliers:", suppliers);
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}
