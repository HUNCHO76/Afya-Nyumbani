<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $items = InventoryItem::orderBy('name')->paginate(15);
        return Inertia::render('Inventory/Index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Inventory/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
        ]);

        InventoryItem::create($validated);

        return redirect('/inventory')->with('success', 'Inventory item created successfully');
    }

    public function edit(InventoryItem $inventory): Response
    {
        return Inertia::render('Inventory/Edit', [
            'item' => $inventory,
        ]);
    }

    public function update(Request $request, InventoryItem $inventory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
        ]);

        $inventory->update($validated);

        return redirect('/inventory')->with('success', 'Inventory item updated successfully');
    }

    public function destroy(InventoryItem $inventory)
    {
        $inventory->delete();
        return redirect('/inventory')->with('success', 'Inventory item deleted successfully');
    }
}
