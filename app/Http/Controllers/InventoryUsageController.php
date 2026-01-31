<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInventoryUsageRequest;
use App\Models\InventoryUsage;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InventoryUsageController extends Controller
{
    public function index()
    {
        $practitioner = Auth::user()->practitioner;
        if (!$practitioner) abort(403);

        $usages = InventoryUsage::with('inventoryItem')
            ->where('practitioner_id', $practitioner->id)
            ->orderBy('used_at', 'desc')
            ->get();

        return inertia('Inventory/Usage/Index', compact('usages'));
    }

    public function store(StoreInventoryUsageRequest $request)
    {
        $practitioner = Auth::user()->practitioner;
        if (!$practitioner) abort(403);

        $data = $request->validated();

        // Ensure inventory item exists and has enough stock (if tracked)
        $item = InventoryItem::findOrFail($data['inventory_item_id']);

        $usage = InventoryUsage::create([
            'inventory_item_id' => $item->id,
            'practitioner_id' => $practitioner->id,
            'quantity_used' => $data['quantity_used'],
            'used_at' => $data['used_at'] ?? now(),
        ]);

        // Optional: decrement inventory stock if the item tracks quantity
        if (isset($item->quantity)) {
            $item->decrement('quantity', $data['quantity_used']);
        }

        return back()->with('success', 'Inventory usage recorded');
    }
}
