import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const letter = url.searchParams.get("letter"); // Get the letter query parameter

    if (!letter || letter.length !== 1) {
      return NextResponse.json(
        { error: "Invalid or missing 'letter' query parameter" },
        { status: 400 }
      );
    }

    const drugs = await prisma.drugList.findMany({
      where: {
        AND: [
          { name: { startsWith: letter, mode: "insensitive" } },
          {
            OR: [{ imageUrl: null }, { imageUrl: "" }],
          },
        ],
      },
      take: 10, // Limit to 10 results
      select: {
        id: true,
        name: true,
        substitutes: true,
        sideEffects: true,
        uses: true,
        chemicalClass: true,
        habitForming: true,
        therapeuticClass: true,
        actionClass: true,
      },
      orderBy: {
        name: "asc", // Sort by name (optional)
      },
    });

    // Get the total number of drugs with images
    const drugsWithImages = await prisma.drugList.count({
      where: {
        AND: [
          { name: { startsWith: letter, mode: "insensitive" } },
          {
            imageUrl: {
              not: null, // Ensure imageUrl is not null
            },
          },
          { imageUrl: { not: "" } }, // Ensure imageUrl is not an empty string
        ],
      },
    });

    // Get the total number of drugs
    const totalDrugs = await prisma.drugList.count({
      where: {
        name: {
          startsWith: letter,
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json(
      {
        drugs,
        totalDrugs,
        drugsWithImages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching drugs:", error);
    return NextResponse.json({ error: "Failed to fetch drugs" }, { status: 500 });
  }
}
