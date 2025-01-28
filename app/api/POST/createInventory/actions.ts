"use server";

import prisma from "@/lib/db";
import { DrugCategory, PackagingType } from "@prisma/client";

export async function CreateDrugInventory(formData: FormData): Promise<void> {
  const supplierId = formData.get("supplierId") as string;
  const drugListId = formData.get("drugListId") as string;

  // Validate and convert category to DrugCategory
  const category = formData.get("category") as string;
  if (!Object.values(DrugCategory).includes(category as DrugCategory)) {
    throw new Error(`Invalid category: ${category}`);
  }

  // Validate and convert packagingType to PackagingType
  const packagingType = formData.get("packagingType") as string;
  if (!Object.values(PackagingType).includes(packagingType as PackagingType)) {
    throw new Error(`Invalid packaging type: ${packagingType}`);
  }

  const costPrice = parseFloat(formData.get("costPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const expirationDate = new Date(formData.get("expirationDate") as string);
  const canBeSoldInOtherForms = formData.get("canBeSoldInOtherForms") === "true";

  let alternateForms: { packagingType: PackagingType; sellingPrice: number, quantity: number }[] = [];
  if (canBeSoldInOtherForms) {
    const forms = formData.get("alternateForms") as string;
    try {
      alternateForms = JSON.parse(forms);
    } catch (error) {
      console.error("Error creating or updating drug inventory:", error);
      throw error;  }
  }

  try {
    const drugInventory = await prisma.drugInventory.upsert({
      where: { drugListId },
      update: {
        supplierId,
        category: category as DrugCategory,
        packagingType: packagingType as PackagingType,
        costPrice,
        sellingPrice,
        quantity,
        expirationDate,
        canBeSoldInOtherForms,
      },
      
      create: {
        supplierId,
        drugListId,
        category: category as DrugCategory,
        packagingType: packagingType as PackagingType,
        costPrice,
        sellingPrice,
        quantity,
        expirationDate,
        canBeSoldInOtherForms,
      },
    });
    console.log("Created/Updated Drug Inventory:", drugInventory);

    if (canBeSoldInOtherForms && alternateForms.length > 0) {
      await prisma.drugForm.deleteMany({
        where: { drugInventoryId: drugInventory.id },
      });
      const forms = await prisma.drugForm.createMany({
        data: alternateForms.map((form) => ({
          drugInventoryId: drugInventory.id,
          packagingType: form.packagingType,
          sellingPrice: form.sellingPrice,
          quantityInBaseUnits: form.quantity,
        })),
      });      console.log("Created Alternate Forms:", forms);

    }

  } catch (error) {
    console.error("Error creating or updating drug inventory:", error);
    throw error;
  }
}

