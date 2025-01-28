"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Drug = {
  id: string;
  name: string;
  substitutes: string[];
  sideEffects: string[];
  uses: string[];
  imageUrl?: string | null;
};

const DrugEntries = () => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadingAll, setUploadingAll] = useState(false); // Track if all uploads are done
  const [submitLoading, setSubmitLoading] = useState(false); // Submit button loading state
  const searchParams = useSearchParams();
  const letter = searchParams.get("letter") || "";
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [totalDrugs, setTotalDrugs] = useState(0);
  const [drugsWithImages, setDrugsWithImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const halfTotalDrugs = Math.floor(totalDrugs / 2);
  // Fetch drugs where imageUrl is empty
  const fetchDrugs = async () => {
    try {
      const response = await fetch(`/entries/GET?letter=${letter}`);
      const data = await response.json();
      setDrugs(data.drugs);
      setTotalDrugs(data.totalDrugs);
      setDrugsWithImages(data.drugsWithImages);
    } catch (error) {
      console.error("Error fetching drugs:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDrugs();
  }, [letter]);

  // Check if all images are uploaded
  const allImagesUploaded = () => {
    return drugs.every((drug) => drug.imageUrl);
  };

  // Handle image preview and upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image before uploading
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setDrugs((prevDrugs) =>
        prevDrugs.map((drug) =>
          drug.id === id ? { ...drug, imageUrl } : drug
        )
      );
    };
    reader.readAsDataURL(file);

    // Start the upload process
    setUploading(id);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("id", id);

    try {
      await fetch(`/entries/POST`, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(null);
    }
  };

  // Handle final submission (or other actions) only when all images are uploaded
  const handleFinalSubmission = async () => {
    if (!allImagesUploaded()) {
      alert("Please upload all images before submitting.");
      return;
    }

    setSubmitLoading(true); // Set submit button loading state

    try {
      setUploadingAll(true);
      // Perform the final submission or any action
      // Simulate submission (e.g., using a delay or API call)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async action

      // Refetch the drugs data after successful submission
      await fetchDrugs(); // Refetch the API data
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setSubmitLoading(false); // Reset submit button loading state
      setUploadingAll(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Drugs Starting with "{letter}"
      </h1>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg">
             <Table>
            <TableCaption>List of drugs where the image is missing.</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-200">
                <TableHead>#</TableHead>
                <TableHead>Drug Name</TableHead>
                <TableHead>Substitutes</TableHead>
                <TableHead>Side Effects</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drugs.map((drug, index) => (
                <TableRow key={drug.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{drug.name}</TableCell>
                  <TableCell>{drug.substitutes.join(", ")}</TableCell>
                  <TableCell>{drug.sideEffects.join(", ")}</TableCell>
                  <TableCell>{drug.uses.join(", ")}</TableCell>
                  <TableCell>
                  {drug.imageUrl ? (
                      <img src={drug.imageUrl} alt={drug.name} className="w-16 h-16 rounded-lg" />
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        className="border p-1 text-sm"
                        onChange={(e) => handleImageUpload(e, drug.id)}
                        disabled={uploading === drug.id}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-medium">
                  Total Drugs: {totalDrugs} | Drugs with Images: {drugsWithImages}
                  <p>Half Goal: {drugsWithImages}/{halfTotalDrugs}</p>  
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <div className="mt-4">
            <button
              onClick={handleFinalSubmission}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
              disabled={submitLoading || uploadingAll || !allImagesUploaded()}
            >
              {submitLoading ? "Submitting..." : "Submit All Images"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugEntries;
