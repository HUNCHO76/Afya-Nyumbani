import React from "react";
import { Link } from "@inertiajs/react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Button } from "@/Components/ui/button";
import { Package, AlertTriangle, TrendingDown, Grid } from "lucide-react";

interface Props {
  summary: {
    totalItems: number;
    totalQuantity: number;
    lowStockCount: number;
    categoriesCount: number;
  };
  lowStockItems: any[];
  inventoryItems: {
    data: any[];
    links: any[];
  };
  recentUsage: any[];
  usageByCategory: any[];
  topUsedItems: any[];
}

const InventoryDashboard = ({ summary, lowStockItems, inventoryItems, recentUsage, usageByCategory, topUsedItems }: Props) => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels and usage</p>
        </div>
        <Link href="/inventory/create">
          <Button>Add New Item</Button>
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{summary.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Grid className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Quantity</p>
              <p className="text-2xl font-bold">{summary.totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">{summary.lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{summary.categoriesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
              <p className="text-sm text-orange-700 mt-1">
                {lowStockItems.length} item(s) are at or below reorder level
              </p>
              <div className="mt-3 space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white rounded px-3 py-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-700">
                        {item.quantity} / {item.reorder_level}
                      </p>
                      <Link href={`/inventory/${item.id}/edit`}>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Restock
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Items Table */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Inventory Items</h2>
          <Link href="/inventory">
            <Button variant="outline" size="sm">View Full List</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Item Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Reorder Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {inventoryItems.data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm">{item.reorder_level}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      item.quantity <= item.reorder_level
                        ? 'bg-red-100 text-red-700'
                        : item.quantity <= item.reorder_level * 1.5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.quantity <= item.reorder_level
                        ? 'Low Stock'
                        : item.quantity <= item.reorder_level * 1.5
                        ? 'Warning'
                        : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/inventory/${item.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Usage History */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Recent Usage</h2>
          </div>
          <div className="p-4">
            {recentUsage.length > 0 ? (
              <div className="space-y-3">
                {recentUsage.map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{usage.item?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        by {usage.practitioner?.user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(usage.used_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">-{usage.quantity_used}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No recent usage</p>
            )}
          </div>
        </div>

        {/* Usage by Category */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Usage by Category (Last 30 Days)</h2>
          </div>
          <div className="p-4">
            {usageByCategory.length > 0 ? (
              <div className="space-y-3">
                {usageByCategory.map((category, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.category}</span>
                      <span className="font-semibold">{category.total_used} units</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(category.total_used / Math.max(...usageByCategory.map(c => c.total_used))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No usage data</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Used Items */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Most Used Items (Last 30 Days)</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            {topUsedItems.map((item, index) => (
              <div key={item.item_id} className="rounded-lg border p-4 text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mx-auto mb-2">
                  #{index + 1}
                </div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.total_used} units used</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

InventoryDashboard.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default InventoryDashboard;
