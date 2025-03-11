import prisma from '@/lib/db'; 
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentDate = new Date();

    // Fetch the drug inventory excluding expired drugs
    const drugInventory = await prisma.drugInventory.findMany({
      where: {
        expirationDate: {
          gt: currentDate, // Only include drugs that are not expired
        },
      },
      include: {
        drugList: true,
        alternateForms: true,
      },
    });

    return NextResponse.json(drugInventory);
  } catch (error) {
    console.error('Error fetching drug inventory:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch drug inventory',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
