import React from "react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Trash2, Edit } from "lucide-react";

interface Practitioner {
  id: string;
  user_id: number;
  specialization: string;
  license_number: string;
  available: boolean;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Props {
  practitioners: Practitioner[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const PractitionersIndexPage = ({ practitioners, flash }: Props) => {
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this practitioner?")) {
      router.delete(`/practitioners/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Manage healthcare practitioners</p>
          <h1 className="text-2xl font-bold text-foreground">Practitioners</h1>
        </div>
        <Link href="/practitioners/create">
          <Button>Add Practitioner</Button>
        </Link>
      </header>

      {flash?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {flash.success}
        </div>
      )}

      {flash?.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {flash.error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Specialization</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">License</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Available</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {practitioners.map((practitioner) => (
              <tr key={practitioner.id} className="hover:bg-muted/30">
                <td className="px-6 py-4 text-sm font-medium">{practitioner.user?.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{practitioner.user?.email}</td>
                <td className="px-6 py-4 text-sm">{practitioner.specialization}</td>
                <td className="px-6 py-4 text-sm">{practitioner.license_number}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    practitioner.available 
                      ? "bg-green-100 text-green-700" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {practitioner.available ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/practitioners/${practitioner.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(practitioner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {practitioners.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No practitioners found. <Link href="/practitioners/create" className="font-semibold text-primary hover:underline">Add one</Link>
        </div>
      )}
    </div>
  );
};

PractitionersIndexPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default PractitionersIndexPage;
