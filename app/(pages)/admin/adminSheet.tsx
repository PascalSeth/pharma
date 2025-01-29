import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
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
import { Gender, } from "@prisma/client";
import { CreateAdmin } from "@/app/api/creation/actions";

export default function AdminSheet() {
  return (
    <Sheet>
      {/* Trigger Button */}
      <SheetTrigger asChild>
        <Button className="w-fit items-end" variant="outline">
          Add Admin
        </Button>
      </SheetTrigger>

      <SheetContent>
        {/* Header Section */}
        <SheetHeader>
          <SheetTitle>Add New Admin</SheetTitle>
          <SheetDescription>Fill in the details for the new Admin below.</SheetDescription>
        </SheetHeader>

        {/* Form */}
        <form action={CreateAdmin} method="POST">
          <div className="grid gap-4 py-4">
            {/* Admin First Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter First Name"
                className="col-span-3"
                required
              />
            </div>

            {/* Admin Last Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter Last Name"
                className="col-span-3"
                required
              />
            </div>

            {/* Admin Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Admin email"
                className="col-span-3"
                required
              />
            </div>

            {/* Admin Gender */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender *
              </Label>
              <Select required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gender</SelectLabel>
                    {Object.values(Gender).map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender} 
                     <input hidden value={gender} name="gender" />
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>


            {/* Admin Address */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address (Optional)
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Enter Address"
                className="col-span-3"
              />
            </div>

            {/* Admin Password */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter Password"
                className="col-span-3"
                required
              />
            </div>
          </div>

          {/* Footer Section */}
          <SheetFooter>
            <SheetClose asChild>
              <Button
              >
                            Save Admin

              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
