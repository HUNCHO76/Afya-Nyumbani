import React from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Loader2 } from "lucide-react";

interface Errors {
  name?: string[];
  email?: string[];
  password?: string[];
  date_of_birth?: string[];
  blood_type?: string[];
  emergency_contact?: string[];
}

interface Props {
  errors?: Errors;
}

const PatientsCreatePage = ({ errors }: Props) => {
  const { data, setData, post, processing } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    date_of_birth: "",
    blood_type: "O+",
    allergies: "",
    emergency_contact: "",
    emergency_contact_phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/patients");
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Register a new patient</p>
        <h1 className="text-2xl font-bold text-foreground">Create Patient</h1>
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
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={data.password}
            onChange={(e) => setData("password", e.target.value)}
            placeholder="Password"
          />
          {errors?.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <Input
            type="password"
            value={data.password_confirmation}
            onChange={(e) => setData("password_confirmation", e.target.value)}
            placeholder="Confirm Password"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date of Birth</label>
          <Input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => setData("date_of_birth", e.target.value)}
          />
          {errors?.date_of_birth && <p className="text-xs text-destructive">{errors.date_of_birth[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Blood Type</label>
          <Select value={data.blood_type} onValueChange={(value) => setData("blood_type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
            </SelectContent>
          </Select>
          {errors?.blood_type && <p className="text-xs text-destructive">{errors.blood_type[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Known Allergies</label>
          <Input
            type="text"
            value={data.allergies}
            onChange={(e) => setData("allergies", e.target.value)}
            placeholder="e.g., Penicillin, Peanuts"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Emergency Contact Name</label>
          <Input
            type="text"
            value={data.emergency_contact}
            onChange={(e) => setData("emergency_contact", e.target.value)}
            placeholder="Contact Name"
          />
          {errors?.emergency_contact && <p className="text-xs text-destructive">{errors.emergency_contact[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Emergency Contact Phone</label>
          <Input
            type="tel"
            value={data.emergency_contact_phone}
            onChange={(e) => setData("emergency_contact_phone", e.target.value)}
            placeholder="Phone Number"
          />
        </div>

        <Button type="submit" disabled={processing} className="w-full">
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Patient"
          )}
        </Button>
      </form>
    </div>
  );
};

PatientsCreatePage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default PatientsCreatePage;
