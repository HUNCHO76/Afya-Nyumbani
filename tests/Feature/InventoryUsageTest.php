<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\Practitioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryUsageTest extends TestCase
{
    use RefreshDatabase;

    public function test_practitioner_can_record_inventory_usage()
    {
        $user = User::factory()->create(['role' => 'practitioner']);
        $practitioner = Practitioner::create(['user_id' => $user->id, 'specialization' => 'Nurse', 'license_number' => 'RU-1', 'years_experience' => 3, 'availability_status' => 'available']);

        $item = InventoryItem::create(['name' => 'Bandage', 'category' => 'Supplies', 'quantity' => 100, 'reorder_level' => 10]);

        $this->actingAs($user)->post(route('practitioner.inventory.usage.store'), [
            'inventory_item_id' => $item->id,
            'quantity_used' => 2,
        ])->assertRedirect();

        $this->assertDatabaseHas('inventory_usage', [
            'inventory_item_id' => $item->id,
            'practitioner_id' => $practitioner->id,
            'quantity_used' => 2,
        ]);

        $this->assertDatabaseHas('inventory_items', [
            'id' => $item->id,
            'quantity' => 98,
        ]);
    }
}
