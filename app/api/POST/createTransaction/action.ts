"use server";

import prisma from "@/lib/db";

export async function CreateTransaction(formData: FormData) {
  try {
    // Log raw formData
    console.log("Raw formData entries:");
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Extract transactions data from formData
    const transactions = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("transactions"))
      .reduce<Record<string, Record<string, any>>>((acc, [key, value]) => {
        const match = key.match(/transactions\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const [, index, field] = match;
          if (!acc[index]) acc[index] = {};
          acc[index][field] = value;
        }
        return acc;
      }, {});

    // Log intermediate transactions object
    console.log("Parsed transactions object:", transactions);

    // Convert transaction objects into an array
    const transactionData = Object.values(transactions).map((transaction) => ({
      drugId: transaction.drugId,
      totalAmount: parseFloat(transaction.totalAmount),
      quantity: parseInt(transaction.quantity, 10),
      dosage: transaction.dosage || null,
    }));

    // Log final transactionData array
    console.log("Final transactionData array:", transactionData);

    // Perform database operations
    for (const transaction of transactionData) {
      await prisma.transaction.create({
        data: {
          drugId: transaction.drugId,
          totalAmount: transaction.totalAmount,
          quantity: transaction.quantity,
          dosage: transaction.dosage,
          tellerId: "transaction.tellerId", // Replace with actual tellerId logic if needed
        },
      });
    }
  } catch (error) {
    console.error("Error creating transactions:", error);
    throw error;
  }
}
