'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DrugCategory } from '@prisma/client';
import { ShoppingBasket, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CreateTransaction } from '../api/POST/createTransaction/action';
import Outofstock from '../components/Outofstock';
import SkeletonHomeComponent from '../components/SkeletonoHome';
import { Input } from '@/components/ui/input';

interface DrugList {
  id: string;
  name: string;
  imageUrl?: string;
  substitutes: string[];
  sideEffects: string[];
  uses: string[];
  chemicalClass: string;
  habitForming: string;
  therapeuticClass: string;
  actionClass: string;
}

interface DrugForm {
  id: string;
  drugInventoryId: string;
  packagingType: string;
  sellingPrice: number;
  quantityInBaseUnits: number;
}

interface InventoryItem {
  id: string;
  costPrice: number;
  quantity: number;
  supplierId: string;
  drugListId: string;
  category: string;
  packagingType: string;
  expirationDate: string;
  canBeSoldInOtherForms: boolean;
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
  drugList: DrugList;
  alternateForms: DrugForm[];
}

interface PosItem {
  id: string;
  drugList: DrugList;
  sellingPrice: number;
  quantity: number;
  packagingType: string;
  dosage?: string
}

function Home() {
  const [drugs, setDrugs] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedForms, setSelectedForms] = useState<{ [key: string]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [posItems, setPosItems] = useState<PosItem[]>([]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await fetch('/api/GET/drugInventory');
        const data: InventoryItem[] = await response.json();
        setDrugs(data);
      } catch (error) {
        console.error('Error fetching drug inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrugs();
  }, []);

  const handleFormChange = (drugId: string, formId: string) => {
    setSelectedForms((prev) => ({ ...prev, [drugId]: formId }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddToPos = (drug: InventoryItem) => {
    const selectedForm = drug.alternateForms.find((form) => form.id === selectedForms[drug.id]) || drug;

    setPosItems((prev) => {
      const itemExists = prev.some((item) => item.id === drug.id);
      if (!itemExists) {
        return [
          ...prev,
          {
            id: drug.id,
            drugList: drug.drugList,
            sellingPrice: selectedForm.sellingPrice,
            quantity: 1,
            packagingType: selectedForm.packagingType,
          },
        ];
      }
      return prev;
    });
  };

  const handleRemoveFromPos = (drugId: string) => {
    setPosItems((prev) => prev.filter((item) => item.id !== drugId));
  };

  const handleQuantityChange = (drugId: string, change: number) => {
    setPosItems((prev) =>
      prev.map((item) => {
        if (item.id === drugId) {
          const drug = drugs.find((d) => d.id === drugId);
          const maxQuantity = drug?.quantity || 0;
  
          // Ensure quantity does not exceed stock or drop below 1
          const newQuantity = Math.max(1, Math.min(item.quantity + change, maxQuantity));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  

  const calculateSubtotal = () => {
    return posItems.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + 0.10; // Adding a platform fee of $0.10
  };

  const filteredDrugs = drugs.filter((drug) => {
    const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
    const matchesSearchTerm = drug.drugList.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  if (loading) {
    return <div><SkeletonHomeComponent/></div>;
  }

  return (
    <div className="grid w-full grid-rows-[auto,1fr] lg:grid-cols-[3fr,1fr] h-screen bg-gray-100">
              
           
    <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Subscription Alert */}
          <div className="bg-gray-800 text-white p-4 rounded-lg flex items-center justify-between col-span-1 lg:col-span-3">
            <div>
              <div className="font-bold">Your subscription is almost expired</div>
              <div className="text-gray-400">
                Upgrade your plan to superior to enjoy various additional benefits
              </div>
            </div>
            <button className="bg-green-500 px-4 py-2 text-white font-semibold rounded-lg hover:bg-green-600">
              Upgrade Plan
            </button>
          </div>
          <div className="col-span-1 lg:col-span-3">
          <Outofstock/>   
</div>

                  <div className="col-span-1 lg:col-span-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <a href="#" className="text-green-600">See all</a>
      </div>

      <Input
        type="text"
        placeholder="Search by drug name..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex overflow-x-auto gap-4 mb-4">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 flex-shrink-0 rounded-lg text-sm font-medium ${selectedCategory === 'all' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-500 hover:text-white'}`}
        >
          All
        </button>
        {Object.values(DrugCategory).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 flex-shrink-0 rounded-lg text-sm font-medium ${selectedCategory === category ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-500 hover:text-white'}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {filteredDrugs.map((drug) => {
          const selectedForm = drug.alternateForms.find((form) => form.id === selectedForms[drug.id]) || drug;

          return (
            <div key={drug.id} className="bg-white flex-col p-4 rounded-lg shadow-md flex">
                 <div className='flex w-full'>
                 <div className='flex flex-col'> 
                   <img
                src={drug.drugList.imageUrl || 'https://i.pinimg.com/736x/ca/df/aa/cadfaac7ed2abf8052db94d540808e60.jpg'}
                alt={drug.drugList.name}
                className="w-32 h-32 object-cover rounded-lg mr-4"
                />
            <p className="text-green-600 font-bold">${selectedForm.sellingPrice} / {selectedForm.packagingType}</p>
 </div>

              <div className="flex-1">
                <h2 className="font-bold text-lg mb-2">{drug.drugList.name}</h2>
                <p className="text-sm text-gray-600 mb-2">{drug.drugList.uses.join(', ')}</p>
</div></div>


<div className='flex items-center justify-between'>
  <div>
{drug.alternateForms.length > 0 && (
                  <Select onValueChange={(value) => handleFormChange(drug.id, value)}>
  <SelectTrigger className="bg-transparent border-none w-full text-gray-700">
  <SelectValue placeholder="Select Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Alternate Forms</SelectLabel>
                        <SelectItem value={drug.id}>{drug.packagingType} - ${drug.sellingPrice}</SelectItem>
                        {drug.alternateForms.map((form) => (
                          <SelectItem key={form.id} value={form.id}>
                            {form.packagingType} - ${form.sellingPrice}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
        </div>      

             <div className="flex items-center mt-3 text-sm">
                        <div className="text-gray-500">
                          <strong className="text-black">Netto:</strong>{drug.category}
                        </div>
                        <div className="text-gray-500 ml-6">
                          <strong className="text-black">Stock:</strong>{' '}
                          {drug.quantity > 0 ? (
                            <span className="text-green-500">{drug.quantity} </span>
                          ) : (
                            <span className="text-red-500">Out of Stock</span>
                          )}
                        </div>
                      </div>

</div>
<div className="flex justify-between items-center mt-4">
  <ShoppingBasket
    className={`text-2xl cursor-pointer ${
      posItems.some((item) => item.id === drug.id) ? 'text-gray-400 cursor-not-allowed' : 'text-green-600'
    }`}
    onClick={() => {
      if (!posItems.some((item) => item.id === drug.id)) {
        handleAddToPos(drug);
      }
    }}
  />
  <Trash
    className={`text-xl cursor-pointer ${
      posItems.some((item) => item.id === drug.id) ? 'text-red-600' : 'text-gray-400 cursor-not-allowed'
    }`}
    onClick={() => {
      if (posItems.some((item) => item.id === drug.id)) {
        handleRemoveFromPos(drug.id);
      }
    }}
  />
</div>

            </div>
          );
        })}
      </div>
</div>
</div>
</div>

<div className="bg-white p-6 h-full shadow-lg flex flex-col">
      <PosComponent posItems={posItems} onQuantityChange={handleQuantityChange} calculateSubtotal={calculateSubtotal} calculateTotal={calculateTotal} />
</div>    
</div>
  );
}




type PosComponentProps = {
  posItems: PosItem[];
  onQuantityChange: (id: string, change: number) => void;
  calculateSubtotal: () => number;
  calculateTotal: () => number;
};

const PosComponent: React.FC<PosComponentProps> = ({
  posItems,
  onQuantityChange,
  calculateSubtotal,
  calculateTotal,
}) => {
  return (
    <form action={CreateTransaction}>

      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-lg">Receipt</div>
          <div className="text-gray-500 text-sm">Total Items: {posItems.length}</div>
        </div>

        {/* Item List */}
        <div className="space-y-4 overflow-y-auto h-fit max-h-48 w-full">
          {posItems.length > 0 ? (
            posItems.map((item) => (
              <div key={item.id} className="border-b border-gray-200 pb-4 mb-4">
                <input type="hidden" name={`transactions[${item.id}][drugId]`} value={item.drugList.id} />
                <input
                  type="hidden"
                  name={`transactions[${item.id}][totalAmount]`}
                  value={(item.sellingPrice * item.quantity).toFixed(2)}
                />
                <input
                  type="hidden"
                  name={`transactions[${item.id}][quantity]`}
                  value={item.quantity}
                />

                <div className="flex items-center space-x-4">
                  <img
                    src={
                      item.drugList.imageUrl ||
                      "https://i.pinimg.com/736x/ca/df/aa/cadfaac7ed2abf8052db94d540808e60.jpg"
                    }
                    alt={item.drugList.name}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-700">{item.drugList.name}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <label htmlFor={`dosage-${item.id}`} className="text-sm text-gray-500">
                        Dosage:
                      </label>
                      <input
                        id={`dosage-${item.id}`}
                        name={`transactions[${item.id}][dosage]`}
                        type="text"
                        placeholder="e.g., 2/day"
                        className="border border-gray-300 rounded-md p-1 text-sm w-24 focus:ring focus:ring-green-200"
                      />
                    </div>
                    <div className="flex items-center justify-between w-40">
                      <div className="text-sm text-gray-500">
                        ${item.sellingPrice.toFixed(2)} / {item.packagingType}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(item.id, -1)}
                          className="w-4 h-4 bg-gray-200 text-gray-700 rounded-full flex justify-center items-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <div className="text-gray-700 font-medium text-sm">{item.quantity}</div>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(item.id, 1)}
                          className="w-4 h-4 bg-gray-200 text-gray-700 rounded-full flex justify-center items-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No items in POS.</div>
          )}
        </div>

        {/* Summary Section */}
        <div className="mt-6">
          <div className="font-semibold text-lg mb-4">Summary</div>
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <div>Subtotal</div>
            <div>${calculateSubtotal().toFixed(2)}</div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <div>Platform fee</div>
            <div>$0.10</div>
          </div>
          <div className="flex justify-between font-bold text-lg mt-4">
            <div>Total</div>
            <div>${calculateTotal().toFixed(2)}</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6">
        <button
            type="submit"
            className={`w-full py-3 rounded-lg font-bold ${
              posItems.length > 0
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
            }`}
            disabled={posItems.length === 0}
          >
            Complete Transaction
          </button>
        </div>
      </div>
    </form>
  );
};


export default Home;
