'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  status: string;
  drugList: {
    id: string;
    name: string;
    imageUrl: string | null
  }
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
      <div className="overflow-x-auto w-full">
        <div className="flex space-x-4 w-max">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg shadow p-4 w-52 h-24 animate-pulse"></div>
            ))}
        </div>
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
    <div className=" w-full">
             <div className="flex  justify-between w-full items-center px-4">
<div>
<h2 className="text-lg font-semibold">Out of Stock Items</h2>

</div>
          <Link href="/outofstock" className="text-blue-600 hover:underline">
            See All
          </Link>
        </div>
      <div className="grid grid-flow-col auto-cols-[minmax(200px,1fr)] gap-4 p-4 w-max">
        {outOfStockItems.map((item) => (
      <div key={item.id} className="bg-white w-full rounded-lg shadow-md p-3 flex items-center gap-4">
      {/* Drug Image */}
      <img
        src={item.drugList.imageUrl ?? 'https://i.pinimg.com/736x/ca/df/aa/cadfaac7ed2abf8052db94d540808e60.jpg'}
        alt={item.drugList.name}
        className="w-20 h-20 object-cover rounded-md"
      />
      
      {/* Drug Details */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-bold">{item.drugList.name}</span>
   
        </div>
        <div className="text-gray-700 text-sm font-medium">{item.name}</div>
        <div className="text-gray-500 text-xs">{item.quantity} items</div>
        <div>
        <span className="bg-black text-white text-xs font-semibold px-2 py-1 rounded-md">
            {item.status}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>
</div>
  );
}

export default Outofstock;
