"use server";

import prisma from "@/lib/db";

export async function CreateSupplier(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone")?.toString() || null;
  const address = formData.get("address")?.toString() || null;

  // Validate required fields
  if (!name || !email) {
    throw new Error("Name and Email are required fields.");
  }

  // Validate email format (simple validation)
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  try {
    // Create new supplier entry
    await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    throw error;
  }
}
