'use client';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DrugCategory, PackagingType } from "@prisma/client";
import { CreateDrugInventory } from "@/app/api/POST/createInventory/actions";
import { Checkbox } from "@/components/ui/checkbox";

type Supplier = { id: string; name: string };
type DrugList = { id: string; name: string; imageUrl: string };

export default function DrugInventoryPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [drugLists, setDrugLists] = useState<DrugList[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPackagingType, setSelectedPackagingType] = useState<string>("");
  const [filteredDrugLists, setFilteredDrugLists] = useState<DrugList[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<string>("");
  const [selectedDrugImage, setSelectedDrugImage] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [canBeSoldInOtherForms, setCanBeSoldInOtherForms] = useState<boolean>(false);
  const [alternateForms, setAlternateForms] = useState<{ quantity: number,packagingType: string; sellingPrice: number }[]>([]);

  const handleAddAlternateForm = () => {
    setAlternateForms([...alternateForms, { packagingType: "", sellingPrice: 0,quantity:0 }]);
  };

  const handleUpdateAlternateForm = (index: number, field: string, value: any) => {
    const updatedForms = [...alternateForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setAlternateForms(updatedForms);
  };

  const handleRemoveAlternateForm = (index: number) => {
    setAlternateForms(alternateForms.filter((_, i) => i !== index));
  };

  // Fetch suppliers on component mount
  useEffect(() => {
    async function fetchSuppliers() {
      const response = await fetch("/api/GET/suppliers");
      const data = await response.json();
      setSuppliers(data);
    }
    fetchSuppliers();
  }, []);

  // Fetch drug list based on search term
  useEffect(() => {
    async function fetchDrugLists() {
      try {
        const response = await fetch(`/api/GET/drugList?query=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setDrugLists(data);
        setFilteredDrugLists(data);
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
      }
    }
    fetchDrugLists();
  }, [searchTerm]);

  // Filter drug list dynamically based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredDrugLists(drugLists);
    } else {
      const filtered = drugLists.filter((drug) =>
        drug.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDrugLists(filtered);
    }
  }, [searchTerm, drugLists]);

  // Handle drug selection and display associated image
  const handleDrugSelection = (drugId: string) => {
    setSelectedDrug(drugId);
    const selected = drugLists.find((drug) => drug.id === drugId);
    setSelectedDrugImage(selected?.imageUrl || null);
  };

  return (
    <form action={CreateDrugInventory} className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Add Drug Inventory</h1>
      <p className="text-lg mb-8">Enter the details of the drug inventory below.</p>

      <div className="grid grid-cols-2 gap-6">
        {/* General Information Section */}
        <div className="p-6 border rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">General Information</h2>
          
          {/* Supplier Dropdown */}
          <div className="mb-4">
            <Label htmlFor="supplier" className="block">Supplier *</Label>
            <Select onValueChange={setSelectedSupplier} value={selectedSupplier} name="supplierId">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Suppliers</SelectLabel>
                  {suppliers.length ? (
                    suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Loading">Loading Suppliers...</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Drug List Dropdown with Search */}
          <div className="mb-4">
            <Label htmlFor="drugList" className="block">Drug List *</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for drug"
              className="mb-2 w-full p-2 border rounded-md"
            />
            <Select name="drugListId" onValueChange={handleDrugSelection} value={selectedDrug}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select drug..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Drugs</SelectLabel>
                  {filteredDrugLists.length ? (
                    filteredDrugLists.map((drug) => (
                      <SelectItem key={drug.id} value={drug.id}>
                        {drug.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="No results">No Results Found</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Display Selected Drug Image */}
          {selectedDrugImage && (
            <div className="mt-4">
              <img
                src={selectedDrugImage}
                alt="Selected Drug"
                className="max-w-full h-auto rounded-md shadow"
              />
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="p-6 border rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Pricing</h2>
          {/* Cost Price */}
          <div className="mb-4">
            <Label htmlFor="costPrice" className="block">Cost Price *</Label>
            <Input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              placeholder="Enter cost price"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          {/* Selling Price */}
          <div>
            <Label htmlFor="sellingPrice" className="block">Selling Price *</Label>
            <Input
              id="sellingPrice"
              name="sellingPrice"
              type="number"
              step="0.01"
              placeholder="Enter selling price"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        {/* Inventory Section */}
        <div className="p-6 border rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Inventory</h2>
          {/* Quantity */}
          <div className="mb-4">
            <Label htmlFor="quantity" className="block">Quantity *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              placeholder="Enter quantity"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          {/* Expiration Date */}
          <div>
            <Label htmlFor="expirationDate" className="block">Expiration Date *</Label>
            <Input
              id="expirationDate"
              name="expirationDate"
              type="date"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        {/* Category Section */}
        <div className="p-6 border rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Category</h2>
          {/* Drug Category */}
          <div className="mb-4">
            <Label htmlFor="category" className="block">Category *</Label>
            <Select onValueChange={setSelectedCategory} value={selectedCategory} name="category">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {Object.values(DrugCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Packaging Type */}
          <div>
            <Label htmlFor="packagingType" className="block">Packaging Type *</Label>
            <Select
              onValueChange={setSelectedPackagingType}
              value={selectedPackagingType}
              name="packagingType"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Packaging Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Packaging Types</SelectLabel>
                  {Object.values(PackagingType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        
      {/* Checkbox for Can Be Sold in Other Forms */}
      <div className="mb-4">
        <Label htmlFor="canBeSoldInOtherForms" className="flex items-center">
          <Checkbox
            id="canBeSoldInOtherForms"
            checked={canBeSoldInOtherForms}
            
            onCheckedChange={() => setCanBeSoldInOtherForms((prev) => !prev)}
            />
              <input type="hidden" name="canBeSoldInOtherForms" value={canBeSoldInOtherForms.toString()} />

          <span className="ml-2">Can be sold in other forms</span>
        </Label>
      </div>

      {canBeSoldInOtherForms && (
        <div className="p-6 border rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Alternate Forms</h2>
          <input 
      type="hidden" 
      name="alternateForms" 
      value={JSON.stringify(alternateForms)} 
    />
          {alternateForms.map((form, index) => (
            <div key={index} className="mb-4">
              
              <div className="flex items-center space-x-4">
                {/* Packaging Type */}
                <div>
                  <Label htmlFor={`packagingType-${index}`} className="block">Packaging Type</Label>
                  <Select
                    onValueChange={(value) => handleUpdateAlternateForm(index, "packagingType", value)}
                    value={form.packagingType}
                    name={`alternateForms[${index}].packagingType`}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Packaging Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Packaging Types</SelectLabel>
                        {Object.values(PackagingType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selling Price */}
                <div>
                  <Label htmlFor={`sellingPrice-${index}`} className="block">Selling Price</Label>
                  <Input
                    id={`sellingPrice-${index}`}
                    name={`alternateForms[${index}].sellingPrice`}
                    type="number"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => handleUpdateAlternateForm(index, "sellingPrice", parseFloat(e.target.value))}
                  />
                </div>
  {/* Quantity */}
  <div>
        <Label htmlFor={`quantity-${index}`} className="block">Quantity</Label>
        <Input
          id={`quantity-${index}`}
          name={`alternateForms[${index}].quantity`}
          type="number"
          value={form.quantity}
          onChange={(e) => handleUpdateAlternateForm(index, "quantity", parseInt(e.target.value, 10))}
        />
      </div>
                {/* Remove Button */}
                <Button type="button" onClick={() => handleRemoveAlternateForm(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" onClick={handleAddAlternateForm} className="mt-4">
            Add Alternate Form
          </Button>
        </div>
      )}

      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <Button type="submit" className="px-6 py-2">Save Drug Inventory</Button>
      </div>
    </form>
  );
}
