"use server";

import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Gender} from "@prisma/client"; // Assuming Gender and Role are enums in your Prisma schema

export async function CreateAdmin(formData: FormData): Promise<void> {
  const {getUser} = getKindeServerSession()
  const admin = getUser()
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  // Validate and convert gender to Gender enum
  const gender = formData.get("gender") as string;
  if (!Object.values(Gender).includes(gender as Gender)) {
    throw new Error(`Invalid gender: ${gender}`);
  }

  

  const address = formData.get("address") as string;
  const password = formData.get("password") as string;

  try {
    // Check if admin already exists
    let dbadmin = await prisma.admin.findUnique({
      where: {
        id:(await admin).id, // Assuming admins are unique by email
      },
    });

    if (!dbadmin) {
      dbadmin = await prisma.admin.create({
        data: {
          firstName,
          lastName,
          email,
          gender: gender as Gender,
          address,
          password, // You should hash this password before saving it
        },
      });
    }

    console.log("Admin created or updated:", dbadmin);
  } catch (error) {
    console.error("Error creating or updating admin:", error);
    throw error;
  }
}
