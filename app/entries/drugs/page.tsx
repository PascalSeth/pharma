'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Drug = {
  id: string;
  name: string;
  imageUrl: string;
};

type ImageState = {
  [key: string]: File | null;
};

function Drugs() {
  const searchParams = useSearchParams();
  const letter = searchParams.get('letter')?.charAt(0).toUpperCase() || 'A'; // Default letter if not provided
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<ImageState>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchDrugs() {
      try {
        if (!/^[A-Z]$/.test(letter)) {
          throw new Error('Invalid letter parameter');
        }
        const response = await fetch(`/entries/GET?letter=${letter}`);
        if (!response.ok) throw new Error('Failed to fetch drugs');
        const data = await response.json();
        
        if (Array.isArray(data.drugs)) {
          setDrugs(data.drugs.slice(0, 10).filter((drug: Drug) => drug.name.charAt(0).toUpperCase() === letter)); // Ensure first character matches
        } else {
          console.error('Unexpected response format:', data);
          setDrugs([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDrugs();
  }, [letter]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>, drugId: string) {
    const file = event.target.files?.[0] || null;
    setSelectedImages(prevState => ({
      ...prevState,
      [drugId]: file,
    }));
  }

  function allImagesSelected(): boolean {
    return drugs.every(drug => selectedImages[drug.id]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData();

    // Append images and ids to the form data
    drugs.forEach((drug) => {
      if (selectedImages[drug.id]) {
        formData.append('image', selectedImages[drug.id]!);
        formData.append('id', drug.id);
      }
    });

    try {
      const response = await fetch('/entries/POST/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit');

      alert('Images uploaded successfully');
    } catch (error) {
      console.error(error);
      alert('Error while submitting');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center text-lg text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Drugs List</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Table className="min-w-full bg-white shadow-lg rounded-lg">
          <TableCaption>List of drugs starting with {letter}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left text-sm font-medium text-gray-700">Image</TableHead>
              <TableHead className="text-left text-sm font-medium text-gray-700">Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drugs.map((drug) => (
              <TableRow key={drug.id} className="hover:bg-gray-100">
                <TableCell className="p-3 flex items-center space-x-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    name="image" 
                    className="text-sm text-gray-500 border border-gray-300 rounded-lg py-1 px-2 focus:outline-none" 
                    onChange={(e) => handleImageChange(e, drug.id)} 
                  />
                  {selectedImages[drug.id] && (
                    <img src={URL.createObjectURL(selectedImages[drug.id]!)} alt="Selected" width={100} className="rounded-md" />
                  )}
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-700">{drug.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <button 
          type="submit" 
          className={`w-full py-2 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none ${submitting || !allImagesSelected() ? 'opacity-50 cursor-not-allowed' : ''}`} 
          disabled={submitting || !allImagesSelected()}
        >
          {submitting ? 'Submitting...' : 'Submit All'}
        </button>
      </form>
    </div>
  );
}

export default Drugs;
