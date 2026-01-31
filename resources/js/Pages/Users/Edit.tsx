import React from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  userRoles?: Array<{ role: string }>;
}

interface Errors {
  name?: string[];
  email?: string[];
  password?: string[];
  role?: string[];
}

interface Props {
  user: User;
  errors?: Errors;
}

const UsersEditPage = ({ user, errors }: Props) => {
  const { data, setData, patch, processing } = useForm({
    name: user.name,
    email: user.email,
    password: "",
    password_confirmation: "",
    role: user.userRoles?.[0]?.role || "support_staff",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(`/users/${user.id}`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Update user information</p>
        <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
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
          <label className="text-sm font-medium">Role</label>
          <Select value={data.role} onValueChange={(value) => setData("role", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="administrator">Administrator</SelectItem>
              <SelectItem value="practitioner">Practitioner</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="support_staff">Support Staff</SelectItem>
            </SelectContent>
          </Select>
          {errors?.role && <p className="text-xs text-destructive">{errors.role[0]}</p>}
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

UsersEditPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default UsersEditPage;
