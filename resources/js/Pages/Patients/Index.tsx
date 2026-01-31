import React from "react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Trash2, Edit } from "lucide-react";

interface Patient {
  id: string;
  user_id: number;
  date_of_birth: string;
  blood_type: string;
  allergies: string;
  emergency_contact: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Props {
  patients: Patient[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const PatientsIndexPage = ({ patients, flash }: Props) => {
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      router.delete(`/patients/${id}`);
    }
  };

  const getAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Manage registered patients</p>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
        </div>
        <Link href="/patients/create">
          <Button>Add Patient</Button>
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
              <th className="px-6 py-3 text-left text-sm font-semibold">Age</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Blood Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Emergency Contact</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-muted/30">
                <td className="px-6 py-4 text-sm font-medium">{patient.user?.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{patient.user?.email}</td>
                <td className="px-6 py-4 text-sm">{getAge(patient.date_of_birth)} years</td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {patient.blood_type || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{patient.emergency_contact || "N/A"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/patients/${patient.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(patient.id)}
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

      {patients.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No patients found. <Link href="/patients/create" className="font-semibold text-primary hover:underline">Add one</Link>
        </div>
      )}
    </div>
  );
};

PatientsIndexPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default PatientsIndexPage;
