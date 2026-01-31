import React from "react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Trash2, Edit } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  userRoles?: Array<{ role: string }>;
}

interface Props {
  users: User[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const UsersIndexPage = ({ users, flash }: Props) => {
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      router.delete(`/users/${id}`);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Manage system users</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">Users</h1>
        </div>
        <Link href="/users/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Add User</Button>
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

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm sm:text-base">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left font-semibold text-xs sm:text-sm">Name</th>
              <th className="px-3 sm:px-6 py-3 text-left font-semibold text-xs sm:text-sm hidden sm:table-cell">Email</th>
              <th className="px-3 sm:px-6 py-3 text-left font-semibold text-xs sm:text-sm">Role</th>
              <th className="px-3 sm:px-6 py-3 text-right font-semibold text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium">{user.name}</td>
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">{user.email}</td>
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm">
                  <span className="inline-block rounded-full bg-primary/10 px-2 sm:px-3 py-1 text-xs font-medium text-primary">
                    {user.userRoles?.[0]?.role || "N/A"}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <Link href={`/users/${user.id}/edit`}>
                      <Button size="sm" variant="outline" className="px-2 sm:px-3">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.id)}
                      className="px-2 sm:px-3"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No users found. <Link href="/users/create" className="font-semibold text-primary hover:underline">Create one</Link>
        </div>
      )}
    </div>
  );
};

UsersIndexPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default UsersIndexPage;
