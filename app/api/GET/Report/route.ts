import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

// Define the letter-person assignments based on the provided table
const letterGroups = [
  { group: 'A', person: 'Tap In', letters: ['A'] },
  { group: 'C', person: 'Pascal', letters: ['C'] },
  { group: 'M V', person: 'Sita', letters: ['M', 'V'] },
  { group: 'D P', person: 'Collins', letters: ['D', 'P'] },
  { group: 'L S Z', person: 'Knightmare', letters: ['L', 'S', 'Z'] },
  { group: 'O G B', person: 'Cyran', letters: ['O', 'G', 'B'] },
  { group: 'N E', person: 'Dedon', letters: ['N', 'E'] }
];

// Fixed rate per group in cedies
const RATE_PER_GROUP = 200;

export async function GET() {
  try {
    // Process each group assignment
    const reportPromises = letterGroups.map(async ({ group, person, letters }) => {
      // For each letter in the group, fetch data
      const letterDetails = await Promise.all(letters.map(async (letter) => {
        // Count drugs without images for this letter
        const drugsWithoutImages = await prisma.drugList.count({
          where: {
            name: {
              startsWith: letter,
              mode: "insensitive",
            },
            OR: [
              { imageUrl: null },
              { imageUrl: "" },
            ],
          },
        });

        // Count drugs with images for this letter
        const drugsWithImages = await prisma.drugList.count({
          where: {
            name: {
              startsWith: letter,
              mode: "insensitive",
            },
            imageUrl: {
              not: null,
            },
            AND: [{ imageUrl: { not: "" } }],
          },
        });

        // Total drugs for this letter
        const letterTotal = drugsWithoutImages + drugsWithImages;
        
        return {
          letter,
          drugsWithoutImages,
          drugsWithImages,
          letterTotal,
          // Calculate expected total (all drugs should eventually have images)
          expectedTotal: letterTotal
        };
      }));

      // Calculate totals for the entire group
      const totalDrugsWithoutImages = letterDetails.reduce((sum, detail) => sum + detail.drugsWithoutImages, 0);
      const totalDrugsWithImages = letterDetails.reduce((sum, detail) => sum + detail.drugsWithImages, 0);
      const totalDrugs = letterDetails.reduce((sum, detail) => sum + detail.letterTotal, 0);
      const totalExpectedImages = letterDetails.reduce((sum, detail) => sum + detail.expectedTotal, 0);
      
      // Calculate work completion percentage
      // If there are no expected images, set completion to 100% to avoid division by zero
      const completionPercentage = totalExpectedImages > 0 
        ? totalDrugsWithImages / totalExpectedImages 
        : 1.0;
      
      // Calculate payment based on completion percentage
      // Total potential payment is RATE_PER_GROUP per letter
      const potentialPayment = RATE_PER_GROUP * letters.length;
      const actualPayment = Math.round(potentialPayment * completionPercentage);

      return {
        group,
        person,
        letters,
        letterDetails,
        totalDrugs,
        totalDrugsWithImages,
        totalDrugsWithoutImages,
        totalExpectedImages,
        completionPercentage: completionPercentage,
        completionDisplay: (completionPercentage * 100).toFixed(2) + '%',
        potentialPayment,
        actualPayment
      };
    });

    // Wait for all queries to complete
    const groupReports = await Promise.all(reportPromises);

    // Calculate summary statistics
    const summary = groupReports.reduce(
      (acc, report) => {
        acc.totalExpectedImages += report.totalExpectedImages;
        acc.totalImagesEntered += report.totalDrugsWithImages;
        acc.totalPotentialPayment += report.potentialPayment;
        acc.totalActualPayment += report.actualPayment;
        acc.totalLetters += report.letters.length;
        return acc;
      },
      { 
        totalPeople: letterGroups.length,
        totalLetters: 0,
        totalExpectedImages: 0,
        totalImagesEntered: 0,
        totalPotentialPayment: 0,
        totalActualPayment: 0,
        overallCompletionPercentage: 0,
        overallCompletionDisplay: ''
      }
    );
    
    // Calculate overall completion percentage (as a number)
    summary.overallCompletionPercentage = summary.totalExpectedImages > 0
      ? summary.totalImagesEntered / summary.totalExpectedImages
      : 1.0;
    
    // Add a display version with the percentage symbol
    summary.overallCompletionDisplay = (summary.overallCompletionPercentage * 100).toFixed(2) + '%';

    // Return the complete report
    return NextResponse.json(
      {
        groupReports,
        summary
      },
      { 
        status: 200, 
        headers: { 
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" 
        } 
      }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate data entry report" },
      { 
        status: 500, 
        headers: { 
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" 
        } 
      }
    );
  }
}