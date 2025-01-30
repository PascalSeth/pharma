import prisma from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract all images and IDs as arrays
    const files = formData.getAll("images[]") as File[];
    const drugListIds = formData.getAll("ids[]") as string[];

    if (files.length === 0 || drugListIds.length === 0) {
      return NextResponse.json({ message: "No files or IDs provided" }, { status: 400 });
    }

    if (files.length !== drugListIds.length) {
      return NextResponse.json({ message: "Mismatched number of images and IDs" }, { status: 400 });
    }

    const uploadResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const drugListId = drugListIds[i];

      // Validate file type
      if (!file || !(file instanceof Blob) || file.type.split("/")[0] !== "image") {
        return NextResponse.json({ message: `Invalid file format for file ${i + 1}` }, { status: 400 });
      }

      // Fetch the drug list from the database
      const drugList = await prisma.drugList.findUnique({
        where: { id: drugListId },
        select: { name: true },
      });

      if (!drugList) {
        return NextResponse.json({ message: `DrugList not found for ID: ${drugListId}` }, { status: 404 });
      }

      const drugName = drugList.name;
      const firstLetter = drugName.charAt(0).toUpperCase();

      // Sanitize the drug name
      const sanitizedDrugName = drugName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const fileName = `${sanitizedDrugName}-${Date.now()}`;
      const folderPath = `drugLists/${firstLetter}/${fileName}`;

      // Upload the image to Supabase
      const { data: imageData, error } = await supabase.storage
        .from("images")
        .upload(folderPath, file, {
          cacheControl: "2592000",
          contentType: file.type,
        });

      if (error) {
        console.error(`Supabase upload error for ID ${drugListId}:`, error);
        continue;
      }

      // Update the drug list in the database
      const updatedDrugList = await prisma.drugList.update({
        where: { id: drugListId },
        data: { imageUrl: imageData.path },
      });

      uploadResults.push({ id: drugListId, imageUrl: updatedDrugList.imageUrl });
    }

    return NextResponse.json({ uploaded: uploadResults }, { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
