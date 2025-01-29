"use client";

import { Suspense, useEffect, useState } from "react";
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const searchParams = useSearchParams();
  const letter = searchParams.get("letter") || "";
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [totalDrugs, setTotalDrugs] = useState(0);
  const [drugsWithImages, setDrugsWithImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<Record<string, File | null>>({});

  const halfTotalDrugs = Math.floor(totalDrugs / 2);

  const fetchDrugs = async () => {
    try {
      const response = await fetch(`/entries/GET?letter=${letter}`);
      const data = await response.json();
  
      // Ensure only drugs that start exactly with the selected letter
      const strictFilteredDrugs = data.drugs.filter((drug: Drug) =>
        drug.name.charAt(0).toLowerCase() === letter.toLowerCase()
      );
  
      setDrugs(strictFilteredDrugs);
      setTotalDrugs(strictFilteredDrugs.length);
      setDrugsWithImages(strictFilteredDrugs.filter((drug:Drug) => drug.imageUrl).length);
    } catch (error) {
      console.error("Error fetching drugs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, [letter]);

  const allImagesSelected = () => {
    return drugs.every((drug) => drug.imageUrl || selectedImages[drug.id]);
  };

  // Handle image selection (but not upload)
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImages((prev) => ({
      ...prev,
      [id]: file,
    }));

    // Preview the image before upload
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
  };

  // Upload all selected images on submit
  const handleFinalSubmission = async () => {
    if (!allImagesSelected()) {
      alert("Please select images for all missing entries before submitting.");
      return;
    }

    setSubmitLoading(true);

    try {
      const uploadPromises = Object.entries(selectedImages).map(async ([id, file]) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);
        formData.append("id", id);

        return fetch(`/entries/POST`, {
          method: "POST",
          body: formData,
        });
      });

      await Promise.all(uploadPromises);

      // Reload the page after submission
      window.location.reload();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Drugs Starting with {letter}
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
                        onChange={(e) => handleImageSelection(e, drug.id)}
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
              disabled={submitLoading || !allImagesSelected()}
            >
              {submitLoading ? "Submitting..." : "Submit All Images"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ParentComponent = () => {
  return (
    <Suspense fallback={<p className="text-gray-600">Loading data...</p>}>
      <DrugEntries />
    </Suspense>
  );
};

export default ParentComponent;
