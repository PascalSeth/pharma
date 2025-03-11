'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Define TypeScript interfaces for the updated data structure
interface LetterDetail {
  letter: string;
  drugsWithoutImages: number;
  drugsWithImages: number;
  letterTotal: number;
  expectedTotal: number;
}

interface GroupReport {
  group: string;
  person: string;
  letters: string[];
  letterDetails: LetterDetail[];
  totalDrugs: number;
  totalDrugsWithImages: number;
  totalDrugsWithoutImages: number;
  totalExpectedImages: number;
  completionPercentage: number;
  completionDisplay: string;
  potentialPayment: number;
  actualPayment: number;
}

interface ReportSummary {
  totalPeople: number;
  totalLetters: number;
  totalExpectedImages: number;
  totalImagesEntered: number;
  totalPotentialPayment: number;
  totalActualPayment: number;
  overallCompletionPercentage: number;
  overallCompletionDisplay: string;
}

interface ReportData {
  groupReports: GroupReport[];
  summary: ReportSummary;
}

const DataEntryReport = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/GET/Report');
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        const data = await response.json();
        setReportData(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) return <div className="flex justify-center py-8">Loading report data...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!reportData) return <div>No report data available</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Data Entry Payment Report</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Group Assignments</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Group</th>
                <th className="p-2 border text-left">Person</th>
                <th className="p-2 border text-left">Letters</th>
                <th className="p-2 border text-right">Expected Images</th>
                <th className="p-2 border text-right">Images Entered</th>
                <th className="p-2 border text-right">Completion</th>
                <th className="p-2 border text-right">Payment (cedies)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.groupReports.map((item: GroupReport) => (
                <tr key={item.group} className="hover:bg-gray-50">
                  <td className="p-2 border font-medium">{item.group}</td>
                  <td className="p-2 border">{item.person}</td>
                  <td className="p-2 border">{item.letters.join(', ')}</td>
                  <td className="p-2 border text-right">{item.totalExpectedImages.toLocaleString()}</td>
                  <td className="p-2 border text-right">{item.totalDrugsWithImages.toLocaleString()}</td>
                  <td className="p-2 border text-right">{item.completionDisplay}</td>
                  <td className="p-2 border text-right">{item.actualPayment.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Letter Details</h2>
        <div className="space-y-6">
          {reportData.groupReports.map((group: GroupReport) => (
            <div key={`details-${group.group}`} className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">
                {group.person} - Group {group.group} ({group.completionDisplay} complete)
              </h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Letter</th>
                    <th className="p-2 border text-right">Without Images</th>
                    <th className="p-2 border text-right">With Images</th>
                    <th className="p-2 border text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {group.letterDetails.map((detail: LetterDetail) => (
                    <tr key={`${group.group}-${detail.letter}`}>
                      <td className="p-2 border">{detail.letter}</td>
                      <td className="p-2 border text-right">{detail.drugsWithoutImages.toLocaleString()}</td>
                      <td className="p-2 border text-right">{detail.drugsWithImages.toLocaleString()}</td>
                      <td className="p-2 border text-right">{detail.letterTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-medium bg-gray-100">
                    <td className="p-2 border">Total</td>
                    <td className="p-2 border text-right">{group.totalDrugsWithoutImages.toLocaleString()}</td>
                    <td className="p-2 border text-right">{group.totalDrugsWithImages.toLocaleString()}</td>
                    <td className="p-2 border text-right">{group.totalDrugs.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-sm">
                <div className="flex justify-between">
                  <span>Potential Payment: {group.potentialPayment.toLocaleString()} cedies</span>
                  <span>Actual Payment: {group.actualPayment.toLocaleString()} cedies</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Summary</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded shadow-sm">
            <div className="text-sm text-gray-500">Total People</div>
            <div className="text-2xl font-bold">{reportData.summary.totalPeople}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow-sm">
            <div className="text-sm text-gray-500">Total Letters</div>
            <div className="text-2xl font-bold">{reportData.summary.totalLetters}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow-sm">
            <div className="text-sm text-gray-500">Overall Completion</div>
            <div className="text-2xl font-bold">{reportData.summary.overallCompletionDisplay}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow-sm">
            <div className="text-sm text-gray-500">Total Payment</div>
            <div className="text-2xl font-bold">{reportData.summary.totalActualPayment.toLocaleString()} cedies</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
          <div className="bg-gray-50 p-4 rounded shadow-sm">
            <div className="text-sm text-gray-500">Expected Images</div>
            <div className="text-2xl font-bold">{reportData.summary.totalExpectedImages.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow-sm">
            <div className="text-sm text-gray-500">Images Entered</div>
            <div className="text-2xl font-bold">{reportData.summary.totalImagesEntered.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Payment Calculation:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Base rate is 200 cedies per letter in a group</li>
            <li>Payment is proportional to completion percentage (images entered ÷ expected images)</li>
            <li>Potential payment: {reportData.summary.totalPotentialPayment.toLocaleString()} cedies</li>
            <li>Actual payment: {reportData.summary.totalActualPayment.toLocaleString()} cedies ({reportData.summary.overallCompletionDisplay} of potential)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataEntryReport;