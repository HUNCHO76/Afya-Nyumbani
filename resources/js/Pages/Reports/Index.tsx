import React from "react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";

const ReportsPage = () => {
  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Analytics and performance insights</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">Reports</h1>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center text-muted-foreground">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Reporting Dashboard</h2>
          <p>Advanced analytics and performance insights coming soon.</p>
        </div>
      </div>
    </div>
  );
};

ReportsPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default ReportsPage;
