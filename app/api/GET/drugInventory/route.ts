import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch the drug inventory from the database
    const drugInventory = await prisma.drugInventory.findMany({
      include: {
        drugList: true,
        alternateForms: true,
         // Ensure related `drugList` data is included if it exists
      },
    });

    // Return the fetched data as a JSON response
    return NextResponse.json(drugInventory);
  } catch (error) {
    // Determine the error message
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    console.error('Error fetching drug inventory:', errorMessage);

    // Return an error response with a 500 status code
    return NextResponse.json(
      {
        error: 'Failed to fetch drug inventory',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
