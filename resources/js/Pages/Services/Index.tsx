import React from "react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";

const ServicesPage = () => {
  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Define offerings and pricing</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">Services</h1>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center text-muted-foreground">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Service Catalog</h2>
          <p>Service management features coming soon.</p>
        </div>
      </div>
    </div>
  );
};

ServicesPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default ServicesPage;
