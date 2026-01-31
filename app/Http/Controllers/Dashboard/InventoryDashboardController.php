<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryUsage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryDashboardController extends Controller
{
    public function index(): Response
    {
        // Inventory summary
        $totalItems = InventoryItem::count();
        $totalQuantity = InventoryItem::sum('quantity');
        $lowStockCount = InventoryItem::whereRaw('quantity <= reorder_level')->count();
        $categories = InventoryItem::distinct('category')->pluck('category')->count();

        // Low stock alerts (items at or below reorder level)
        $lowStockItems = InventoryItem::whereRaw('quantity <= reorder_level')
            ->orderBy('quantity')
            ->get();

        // All inventory items
        $inventoryItems = InventoryItem::orderBy('name')->paginate(20);

        // Recent usage history
        $recentUsage = InventoryUsage::with(['inventoryItem', 'practitioner.user'])
            ->orderBy('used_at', 'desc')
            ->take(15)
            ->get();

        // Usage by category (last 30 days)
        $usageByCategory = InventoryUsage::join('inventory_items', 'inventory_usage.inventory_item_id', '=', 'inventory_items.id')
            ->selectRaw('inventory_items.category, SUM(inventory_usage.quantity_used) as total_used')
            ->where('inventory_usage.used_at', '>=', now()->subDays(30))
            ->groupBy('inventory_items.category')
            ->get();

        // Top used items (last 30 days)
        $topUsedItems = InventoryUsage::with('inventoryItem')
            ->selectRaw('inventory_item_id, SUM(quantity_used) as total_used')
            ->where('used_at', '>=', now()->subDays(30))
            ->groupBy('inventory_item_id')
            ->orderByDesc('total_used')
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Inventory', [
            'summary' => [
                'totalItems' => $totalItems,
                'totalQuantity' => $totalQuantity,
                'lowStockCount' => $lowStockCount,
                'categories' => $categories,
            ],
            'lowStockItems' => $lowStockItems,
            'inventoryItems' => $inventoryItems,
            'recentUsage' => $recentUsage,
            'usageByCategory' => $usageByCategory,
            'topUsedItems' => $topUsedItems,
        ]);
    }
}
