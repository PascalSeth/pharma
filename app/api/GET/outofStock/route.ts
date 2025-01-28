import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current date
    const currentDate = new Date();

    // Query the database for expired or out-of-stock drugs
    const expiredAndOutOfStockDrugs = await prisma.drugInventory.findMany({
      where: {
        OR: [
          {
            expirationDate: {
              lt: currentDate, // Expired items
            },
          },
          {
            quantity: 0, // Out of stock items
          },
        ],
      },
      include: {
        drugList: true, // Include the associated drug list data
      },
    });

    // Return the data as JSON
    return NextResponse.json(expiredAndOutOfStockDrugs);
  } catch (error) {
    console.error('Error fetching expired or out-of-stock drugs:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
