import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { supabase } from "@/lib/supabase";

// Function to sanitize file names (remove special characters and replace spaces)
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace special characters with dashes
    .replace(/^-+|-+$/g, ""); // Trim leading and trailing dashes
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const images = formData.getAll("images[]") as File[];
    const ids = formData.getAll("ids[]") as string[];

    if (!images.length || images.length !== ids.length) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedDrugs = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const drugListId = ids[i];

      // Fetch drug name from database
      const drug = await prisma.drugList.findUnique({
        where: { id: drugListId },
        select: { name: true },
      });

      if (!drug) continue; // Skip if drug not found

      // Sanitize name for filename
      const sanitizedFileName = sanitizeFileName(drug.name);
      const fileExt = file.name.split(".").pop();
      const firstLetter = drug.name.charAt(0).toUpperCase();
      const folderLetter = /^[A-Z]$/.test(firstLetter) ? firstLetter : "Unknown";

      // Define file path based on the letter folder
      const filePath = `drugLists/${folderLetter}/${sanitizedFileName}.${fileExt}`;

      // Convert File to Blob and rename
      const renamedFile = new File([await file.arrayBuffer()], `${sanitizedFileName}.${fileExt}`, {
        type: file.type,
      });

      const { data: imageData, error } = await supabase.storage
        .from("images")
        .upload(filePath, renamedFile, {
          cacheControl: "2592000",
          contentType: renamedFile.type,
          upsert: true,
        });

      if (error) throw new Error(error.message);

      // Update database with image path
      const updatedDrugList = await prisma.drugList.update({
        where: { id: drugListId },
        data: { imageUrl: imageData.path }, // Using imageData.path
      });

      updatedDrugs.push(updatedDrugList);
    }

    return NextResponse.json({ success: true, updatedDrugs }, { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
