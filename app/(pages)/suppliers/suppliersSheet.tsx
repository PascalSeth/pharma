import { CreateSupplier } from "@/app/api/POST/createSupplier/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SupplierSheet() {
  return (
    <Sheet>
      {/* Trigger Button */}
      <SheetTrigger asChild>
        <Button className="w-fit items-end" variant="outline">
          Add Supplier
        </Button>
      </SheetTrigger>

      <SheetContent>
        {/* Header Section */}
        <SheetHeader>
          <SheetTitle>Add New Supplier</SheetTitle>
          <SheetDescription>Fill in the details for the new supplier below.</SheetDescription>
        </SheetHeader>

        {/* Form */}
        <form action={CreateSupplier} method="POST">
          <div className="grid gap-4 py-4">
            {/* Supplier Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Supplier Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter supplier name"
                className="col-span-3"
                required
              />
            </div>

            {/* Supplier Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter supplier email"
                className="col-span-3"
                required
              />
            </div>

            {/* Supplier Phone */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="Enter phone number"
                className="col-span-3"
              />
            </div>

            {/* Supplier Address */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address (Optional)
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Enter address"
                className="col-span-3"
              />
            </div>
          </div>

          {/* Footer Section */}
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save Supplier</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
