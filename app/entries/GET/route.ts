import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log("Incoming request URL:", request.url);

    const url = new URL(request.url);
    const letter = url.searchParams.get("letter");

    console.log("Extracted letter:", letter);

    if (!letter || letter.length !== 1) {
      console.error("Invalid letter parameter:", letter);
      return NextResponse.json(
        { error: "Invalid or missing 'letter' query parameter" },
        { status: 400 }
      );
    }

    console.log("Querying database with letter:", letter);

    const drugs = await prisma.drugList.findMany({
      where: {
        OR: [{ imageUrl: null }, { imageUrl: "" }],
        name: {
          startsWith: letter,
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

    console.log("Fetched drugs:", drugs);

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

    console.log("Drugs with images:", drugsWithImages);

    const totalDrugs = await prisma.drugList.count({
      where: {
        name: {
          startsWith: letter,
          mode: "insensitive",
        },
      },
    });

    console.log("Total drugs:", totalDrugs);

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
