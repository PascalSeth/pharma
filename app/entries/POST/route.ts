import prisma from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    console.log("Form Data:", formData);

    const file = formData.get("image") as File;
    console.log("File:", file);

    const drugListId = formData.get("id") as string;
    console.log("Drug List ID:", drugListId);

    // Validate file type
    const fileType = file.type.split("/")[0];
    if (fileType !== "image") {
      return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
    }

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: "No valid file uploaded" }, { status: 400 });
    }

    if (!drugListId || typeof drugListId !== "string") {
      return NextResponse.json({ message: "DrugList ID is required and should be a string" }, { status: 400 });
    }

    // Fetch the drug list from the database
    const drugList = await prisma.drugList.findUnique({
      where: { id: drugListId },
      select: { name: true },
    });

    if (!drugList) {
      return NextResponse.json({ message: "DrugList not found" }, { status: 404 });
    }

    console.log("Drug List:", drugList);

    const drugName = drugList.name;
    const firstLetter = drugName.charAt(0).toUpperCase();

    // Sanitize the drug name to prevent special characters or spaces
    const sanitizedDrugName = drugName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
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
      console.error("Supabase upload error:", error);
      return NextResponse.json({ message: `Upload failed: ${error.message}` }, { status: 500 });
    }

    console.log("Supabase upload success:", imageData);

    // Update the drug list in the database
    const updatedDrugList = await prisma.drugList.update({
      where: { id: drugListId },
      data: { imageUrl: imageData.path },
    });

    console.log("Updated Drug List:", updatedDrugList);

    return NextResponse.json({ imageUrl: updatedDrugList.imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
