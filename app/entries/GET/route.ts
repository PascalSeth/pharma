import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log("Incoming request URL:", request.url);

    const url = new URL(request.url);
    const letter = url.searchParams.get("letter")?.charAt(0) || "";
    if (!letter.match(/^[a-zA-Z]$/)) { // Ensures only single alphabets
      return NextResponse.json(
        { error: "Invalid 'letter' query parameter. Must be a single letter." },
        { status: 400 }
      );
    }
    
    console.log("Extracted letter:", letter);

    if (!letter || letter.length !== 1) {
      console.error("Invalid letter parameter:", letter);
      return NextResponse.json(
        { error: "Invalid or missing 'letter' query parameter" },
        { status: 400 }
      );
    }

    // Ensure that the letter is case-insensitive and only fetch names starting with that letter
    const drugs = await prisma.drugList.findMany({
      where: {
        OR: [{ imageUrl: null }, { imageUrl: "" }],
        name: {
          // Ensure the name starts with the provided letter (case-insensitive)
startsWith: letter.toLowerCase(),
          mode: "insensitive",
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const drugsWithImages = await prisma.drugList.count({
      where: {
        name: {
startsWith: letter.toLowerCase(),
          mode: "insensitive",
        },
        imageUrl: {
          not: null,
        },
        AND: [{ imageUrl: { not: "" } }],
      },
    });

    const totalDrugs = await prisma.drugList.count({
      where: {
        name: {
startsWith: letter.toLowerCase(),
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
