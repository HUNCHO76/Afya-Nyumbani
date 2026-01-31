import React from "react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";

const PaymentsPage = () => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Review invoices and payment statuses</p>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card p-4 text-muted-foreground">
        Payments list coming soon.
      </div>
    </div>
  );
};

PaymentsPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default PaymentsPage;
