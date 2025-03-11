import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentDate = new Date();

    // Query the database for expired or out-of-stock drugs
    const expiredAndOutOfStockDrugs = await prisma.drugInventory.findMany({
      where: {
        OR: [
          { expirationDate: { lt: currentDate } }, // Expired items
          { quantity: 0 }, // Out of stock items
        ],
      },
      include: {
        drugList: true, // Include associated drug list data
      },
    });

    // Add status field to indicate whether the drug is expired or out of stock
    const formattedDrugs = expiredAndOutOfStockDrugs.map((drug) => ({
      ...drug,
      status: drug.expirationDate < currentDate ? 'expired' : 'out of stock',
    }));

    return NextResponse.json(formattedDrugs);
  } catch (error) {
    console.error('Error fetching expired or out-of-stock drugs:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
