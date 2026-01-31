import React from 'react';
import { Head } from '@inertiajs/react';

const InventoryUsageIndex = ({ usages }: any) => {
  return (
    <div className="p-6">
      <Head title="Inventory Usage" />
      <h1 className="text-2xl font-bold mb-4">My Inventory Usage</h1>

      {usages.length === 0 ? (
        <p className="text-muted-foreground">No usage records yet.</p>
      ) : (
        <div className="space-y-4">
          {usages.map((u: any) => (
            <div key={u.id} className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{u.inventory_item.name}</div>
                  <div className="text-sm text-muted-foreground">Used: {new Date(u.used_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Qty: {u.quantity_used}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryUsageIndex;
