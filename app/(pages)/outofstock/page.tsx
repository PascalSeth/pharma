'use client'
import React, { useEffect, useState } from "react";

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  status: string;
  drugList: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

const Outofstock = () => {
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutOfStockItems = async () => {
      try {
        const response = await fetch("/api/GET/outofStock");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data: InventoryItem[] = await response.json();
        setOutOfStockItems(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOutOfStockItems();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {outOfStockItems.map((item) => (
        <div key={item.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            {item.drugList.imageUrl ? (
              <img
                src={item.drugList.imageUrl || ''}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center">
                <span>No Image</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{item.drugList.name}</h3>
              <p className="text-gray-500">
                {item.status}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Outofstock;

