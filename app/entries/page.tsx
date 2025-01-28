"use client";

import React from "react";
import { useRouter } from "next/navigation";

const letters = ["A", "C", "M", "D", "L", "O", "N", "E", "G", "S", "P", "V", "B", "Z"];

const Grid = () => {
  const router = useRouter();

  const handleClick = (letter: string) => {
    router.push(`/entries/drugs?letter=${letter}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Select a Drug Letter to Make Entries
      </h1>

      {/* Grid Container */}
      <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-lg">
        {letters.map((letter) => (
          <button
            key={letter}
            className="flex items-center justify-center w-16 h-16 text-2xl font-semibold text-white bg-blue-500 rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-600 active:scale-95 shadow-md"
            onClick={() => handleClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Grid;
