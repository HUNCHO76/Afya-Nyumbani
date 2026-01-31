import React from "react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";

const InventoryPage = () => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Track consumables and stock levels</p>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card p-4 text-muted-foreground">
        Inventory table coming soon.
      </div>
    </div>
  );
};

InventoryPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default InventoryPage;
