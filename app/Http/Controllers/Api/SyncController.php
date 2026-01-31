<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vital;
use App\Models\InventoryUsage;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    public function syncVitals(Request $request): JsonResponse
    {
        // Accept an array of vitals
        $data = $request->input('vitals', []);

        $created = [];

        foreach ($data as $item) {
            $validator = Validator::make($item, [
                'visit_id' => 'nullable|exists:visits,id',
                'blood_pressure_systolic' => 'nullable|integer',
                'blood_pressure_diastolic' => 'nullable|integer',
                'temperature' => 'nullable|numeric',
                'heart_rate' => 'nullable|integer',
                'sugar_level' => 'nullable|numeric',
                'notes' => 'nullable|string',
                'recorded_at' => 'nullable|date',
            ]);

            if ($validator->fails()) continue;

            $vital = Vital::create([
                'visit_id' => $item['visit_id'] ?? null,
                'blood_pressure_systolic' => $item['blood_pressure_systolic'] ?? null,
                'blood_pressure_diastolic' => $item['blood_pressure_diastolic'] ?? null,
                'temperature' => $item['temperature'] ?? null,
                'heart_rate' => $item['heart_rate'] ?? null,
                'sugar_level' => $item['sugar_level'] ?? null,
                'notes' => $item['notes'] ?? null,
                'recorded_by' => $request->user()?->id,
                'recorded_at' => $item['recorded_at'] ?? now(),
            ]);

            $created[] = $vital;
        }

        return response()->json(['created' => $created], 201);
    }

    public function syncInventoryUsage(Request $request): JsonResponse
    {
        $data = $request->input('usages', []);
        $created = [];

        foreach ($data as $item) {
            $validator = Validator::make($item, [
                'inventory_item_id' => 'required|exists:inventory_items,id',
                'quantity_used' => 'required|integer|min:1',
                'used_at' => 'nullable|date',
            ]);

            if ($validator->fails()) continue;

            $usage = InventoryUsage::create([
                'inventory_item_id' => $item['inventory_item_id'],
                'practitioner_id' => $request->user()?->practitioner?->id,
                'quantity_used' => $item['quantity_used'],
                'used_at' => $item['used_at'] ?? now(),
            ]);

            // Optionally decrement stock if the inventory item tracks it
            if ($usage->inventoryItem && isset($usage->inventoryItem->quantity)) {
                $usage->inventoryItem->decrement('quantity', $usage->quantity_used);
            }

            $created[] = $usage;
        }

        return response()->json(['created' => $created], 201);
    }

    public function syncVisits(Request $request): JsonResponse
    {
        $data = $request->input('visits', []);
        $created = [];

        foreach ($data as $item) {
            $validator = Validator::make($item, [
                'booking_id' => 'required|exists:bookings,id',
                'check_in_time' => 'nullable|date',
                'check_out_time' => 'nullable|date',
                'visit_notes' => 'nullable|string',
            ]);

            if ($validator->fails()) continue;

            $visit = Visit::firstOrCreate([
                'booking_id' => $item['booking_id'],
            ],[
                'practitioner_id' => $request->user()?->practitioner?->id,
                'check_in_time' => $item['check_in_time'] ?? null,
                'check_out_time' => $item['check_out_time'] ?? null,
                'visit_notes' => $item['visit_notes'] ?? null,
            ]);

            $created[] = $visit;
        }

        return response()->json(['created' => $created], 201);
    }
}
