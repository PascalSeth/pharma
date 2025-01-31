import prisma from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    console.log("Incoming request URL:", request.url);
    
    const url = new URL(request.url);
    const letter = url.searchParams.get("letter")?.charAt(0) || "";
    if (!letter.match(/^[a-zA-Z]$/)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid 'letter' query parameter. Must be a single letter." }),
        { status: 400, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
      );
    }

    console.log("Extracted letter:", letter);
    
    // Fetch drugs ensuring names start with the given letter (case-insensitive)
    const drugs = await prisma.drugList.findMany({
      where: {
        name: {
          startsWith: letter,
          mode: "insensitive",
        },
        OR: [{ imageUrl: null }, { imageUrl: "" }, ],
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Count drugs with images
    const drugsWithImages = await prisma.drugList.count({
      where: {
        name: {
          startsWith: letter,
          mode: "insensitive",
        },
        imageUrl: {
          not: null,
        },
        AND: [{ imageUrl: { not: "" } }],
      },
    });

    // Count total drugs
    const totalDrugs = await prisma.drugList.count({
      where: {
        name: {
          startsWith: letter,
          mode: "insensitive",
        },
      },
    });

    return new NextResponse(
      JSON.stringify({ drugs, totalDrugs, drugsWithImages }),
      { status: 200, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error) {
    console.error("Error fetching drugs:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch drugs" }),
      { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  }
}