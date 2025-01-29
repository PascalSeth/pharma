'use client'
import React, { useEffect, useState } from 'react';

type InventoryItem = {
  image: string;
  drugList: {
    name: string;
  };
  quantity: number;
  expirationDate: string;
};


function Outofstock() {
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutOfStock = async () => {
      try {
        const response = await fetch('/api/GET/outofStock');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data: InventoryItem[] = await response.json();
        setOutOfStockItems(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchOutOfStock();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg shadow p-4 animate-pulse h-20"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (outOfStockItems.length === 0) {
    return <div className="text-gray-500 text-lg">No out-of-stock or expired drugs</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {outOfStockItems.map((item) => {
        const isExpired = new Date(item.expirationDate) < new Date();
        const status = isExpired ? 'Expired' : 'Out of Stock';

        return (
          <div key={item.image} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <img src={item.image} alt={item.drugList.name} className="w-16 h-16 rounded-full mb-2" />
            <span className="bg-gray-200 text-xs font-semibold px-2 py-1 rounded-md">{status}</span>
            <div className="text-gray-700 mt-2 text-sm font-medium text-center">{item.drugList.name}</div>
            <div className="text-gray-500 text-xs">{item.quantity} items</div>
          </div>
        );
      })}
    </div>
  );
}

export default Outofstock;
