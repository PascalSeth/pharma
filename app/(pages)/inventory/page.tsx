"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// Define the types for the fetched data
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

export default function PharmacyInventory() {
  const [data, setData] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");

  React.useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("/api/GET/drugInventory");
        if (!response.ok) throw new Error("Failed to fetch inventory data.");
        const inventoryData: InventoryItem[] = await response.json();
        setData(inventoryData);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "drugName",
      accessorFn: (row) => row.drugList.name,
      header: "Item Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <img
            src={row.original.drugList.imageUrl || "https://i.pinimg.com/736x/ca/df/aa/cadfaac7ed2abf8052db94d540808e60.jpg"}
            alt={row.original.drugList.name}
            className="w-10 h-10 rounded-full mr-4"
          />
          <span>{row.original.drugList.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "expirationDate",
      header: "Expiration Date",
      cell: ({ row }) => <div>{row.getValue("expirationDate")}</div>,
    },
    {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View Item</DropdownMenuItem>
            <DropdownMenuItem>Delete Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white w-full p-6 h-full shadow-lg flex flex-col">
      <Link className="w-fit" href="/inventory/add-inventory">
        <Button className="w-fit items-end" variant="outline">
          Add Inventory
        </Button>
      </Link>
      <div className="flex justify-between items-center mb-6">
        <div className="font-semibold text-lg">Pharmacy Inventory</div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value === "all" ? "" : value);
              table.getColumn("category")?.setFilterValue(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger className="w-64 border rounded-lg py-2 px-4 text-sm shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Capsule">Capsule</SelectItem>
                <SelectItem value="Bottle">Bottle</SelectItem>
                <SelectItem value="Injectable">Injectable</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              table.getColumn("drugName")?.setFilterValue(e.target.value);
            }}
            placeholder="Search for medical items here"
            className="border rounded-lg py-2 px-4 text-sm w-64 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
