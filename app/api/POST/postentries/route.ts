import { NextRequest, NextResponse } from "next/server"; 
import prisma from "@/lib/db";
import { supabase } from "@/lib/supabase";

// Function to sanitize and make filename unique
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

    // Fetch drug info
    const drug = await prisma.drugList.findUnique({
      where: { id: drugListId },
      select: { name: true, imageUrl: true }, // Fetch existing image
    });

    if (!drug) {
      return NextResponse.json({ error: "Drug not found" }, { status: 404 });
    }

    // Sanitize name and create unique filename
    const sanitizedFileName = sanitizeFileName(drug.name);
    const fileExt = file.name.split(".").pop();
    const firstLetter = drug.name.charAt(0).toUpperCase();
    const folderLetter = /^[A-Z]$/.test(firstLetter) ? firstLetter : "Unknown";

    // **Append timestamp to ensure uniqueness**
    const timestamp = Date.now();
    const newFilePath = `drugLists/${folderLetter}/${sanitizedFileName}-${timestamp}.${fileExt}`;

    // **Step 1: Ensure Old File is Deleted Before Uploading**
    if (drug.imageUrl) {
      console.log(`Deleting old file: ${drug.imageUrl}`);
      const { error: deleteError } = await supabase.storage
        .from("images")
        .remove([drug.imageUrl]); 

      if (deleteError) {
        console.error("Supabase delete error:", deleteError.message);
        return NextResponse.json({ error: "Failed to delete existing file" }, { status: 500 });
      }
      console.log("Old file deleted successfully.");
    }

    // **Step 2: Upload New Image**
    console.log(`Uploading new file: ${newFilePath}`);
    const { data: imageData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(newFilePath, file, {
        cacheControl: "2592000",
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    console.log("New file uploaded successfully.");

    // **Step 3: Update Database with New Image Path**
    const updatedDrugList = await prisma.drugList.update({
      where: { id: drugListId },
      data: { imageUrl: imageData.path },
    });

    return NextResponse.json({
      success: true,
      updatedDrugList,
      message: "New file uploaded and path updated.",
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
