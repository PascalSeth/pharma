import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || ""; // Extract the query parameter

  try {
    const drugs = await prisma.drugList.findMany({
      where: {
        name: {
          contains: query, // Match drug names containing the query
          mode: "insensitive", // Case-insensitive match
        },
      },
      select: { id: true, name: true,imageUrl: true }, // Fetch only the required fields
      take: 100, // Optional: Limit the number of results
    });

    console.log("Fetched drugs:", drugs);
    return NextResponse.json(drugs);
  } catch (error) {
    console.error("Error fetching drugs:", error);
    return NextResponse.json({ error: "Failed to fetch drugs" }, { status: 500 });
  }
}
