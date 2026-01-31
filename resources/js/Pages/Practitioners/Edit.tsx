import React from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Checkbox } from "@/Components/ui/checkbox";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Loader2 } from "lucide-react";

interface Practitioner {
  id: string;
  user_id: number;
  specialization: string;
  license_number: string;
  available: boolean;
  user?: {
    name: string;
    email: string;
  };
}

interface Errors {
  name?: string[];
  email?: string[];
  password?: string[];
  specialization?: string[];
  license_number?: string[];
}

interface Props {
  practitioner: Practitioner;
  errors?: Errors;
}

const PractitionersEditPage = ({ practitioner, errors }: Props) => {
  const { data, setData, patch, processing } = useForm({
    name: practitioner.user?.name || "",
    email: practitioner.user?.email || "",
    password: "",
    password_confirmation: "",
    specialization: practitioner.specialization,
    license_number: practitioner.license_number,
    available: practitioner.available,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(`/practitioners/${practitioner.id}`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Update practitioner information</p>
        <h1 className="text-2xl font-bold text-foreground">Edit Practitioner</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input
            type="text"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            placeholder="Full Name"
          />
          {errors?.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            placeholder="Email Address"
          />
          {errors?.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password (leave blank to keep current)</label>
          <Input
            type="password"
            value={data.password}
            onChange={(e) => setData("password", e.target.value)}
            placeholder="New Password (optional)"
          />
          {errors?.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <Input
            type="password"
            value={data.password_confirmation}
            onChange={(e) => setData("password_confirmation", e.target.value)}
            placeholder="Confirm New Password"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Specialization</label>
          <Input
            type="text"
            value={data.specialization}
            onChange={(e) => setData("specialization", e.target.value)}
            placeholder="e.g., Nurse, Doctor, Physiotherapist"
          />
          {errors?.specialization && <p className="text-xs text-destructive">{errors.specialization[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">License Number</label>
          <Input
            type="text"
            value={data.license_number}
            onChange={(e) => setData("license_number", e.target.value)}
            placeholder="License Number"
          />
          {errors?.license_number && <p className="text-xs text-destructive">{errors.license_number[0]}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="available"
            checked={data.available}
            onCheckedChange={(checked) => setData("available", checked as boolean)}
          />
          <label htmlFor="available" className="text-sm font-medium cursor-pointer">
            Available for assignments
          </label>
        </div>

        <Button type="submit" disabled={processing} className="w-full">
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
};

PractitionersEditPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default PractitionersEditPage;
