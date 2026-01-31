<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryUsage;
use App\Models\InventoryItem;
use App\Models\Practitioner;

class InventoryUsageSeeder extends Seeder
{
    public function run(): void
    {
        $item = InventoryItem::first() ?? InventoryItem::factory()->create();
        $practitioner = Practitioner::first() ?? Practitioner::factory()->create();

        InventoryUsage::create([
            'inventory_item_id' => $item->id,
            'practitioner_id' => $practitioner->id,
            'quantity_used' => 5,
            'used_at' => now()->subDays(1),
        ]);
    }
}
