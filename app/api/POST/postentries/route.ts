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
    // Extract form data
    const formData = await req.formData();
    const drugListId = formData.get("id") as string;
    const file = formData.get("image") as File;

    if (!file || !drugListId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Fetch drug name from database
    const drug = await prisma.drugList.findUnique({
      where: { id: drugListId },
      select: { name: true },
    });

    if (!drug) {
      return NextResponse.json({ error: "Drug not found" }, { status: 404 });
    }

    // Sanitize name for filename
    const sanitizedFileName = sanitizeFileName(drug.name);
    const fileExt = file.name.split(".").pop();
    const firstLetter = drug.name.charAt(0).toUpperCase();
    const folderLetter = /^[A-Z]$/.test(firstLetter) ? firstLetter : "Unknown";

    // Define file path based on the letter folder
    const filePath = `drugLists/${folderLetter}/${sanitizedFileName}.${fileExt}`;

    
    // Upload new image to Supabase
    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "2592000",
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase upload error:", error.message); // Add detailed error logging here
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the drug list with the new image path
    const updatedDrugList = await prisma.drugList.update({
      where: { id: drugListId },
      data: { imageUrl: imageData.path },
    });

    return NextResponse.json({ success: true, updatedDrugList }, { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
