<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\InventoryItem;
use App\Models\Practitioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_practitioner_can_sync_vitals()
    {
        $user = User::factory()->create(['role' => 'practitioner']);
        $practitioner = Practitioner::create(['user_id' => $user->id, 'specialization' => 'Nurse', 'license_number' => 'RN-123', 'years_experience' => 3, 'availability_status' => 'available']);

        \Laravel\Sanctum\Sanctum::actingAs($user);

        $response = $this->postJson('/api/practitioner/sync/vitals', [
                'vitals' => [
                    ['temperature' => 36.6, 'heart_rate' => 80],
                ],
            ]);

        if ($response->status() !== 201) {
            fwrite(STDERR, "SYNC VITALS DEBUG STATUS: {$response->status()}\n");
            fwrite(STDERR, "BODY: {$response->getContent()}\n");
        }

        $this->assertEquals(201, $response->status());

        $this->assertDatabaseCount('vitals', 1);
    }

    public function test_practitioner_can_sync_inventory_usage()
    {
        $user = User::factory()->create(['role' => 'practitioner']);
        $practitioner = Practitioner::create(['user_id' => $user->id, 'specialization' => 'Nurse', 'license_number' => 'RN-124', 'years_experience' => 4, 'availability_status' => 'available']);

        $item = InventoryItem::create(['name' => 'Gauze', 'category' => 'Supplies', 'quantity' => 50, 'reorder_level' => 10]);

        \Laravel\Sanctum\Sanctum::actingAs($user);

        $this->postJson('/api/practitioner/sync/inventory-usage', [
                'usages' => [
                    ['inventory_item_id' => $item->id, 'quantity_used' => 2],
                ],
            ])->assertStatus(201);

        $this->assertDatabaseHas('inventory_usage', ['inventory_item_id' => $item->id, 'quantity_used' => 2]);
        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'quantity' => 48]);
    }

    public function test_practitioner_can_sync_visits()
    {
        $user = User::factory()->create(['role' => 'practitioner']);
        $practitioner = Practitioner::create(['user_id' => $user->id, 'specialization' => 'Nurse', 'license_number' => 'RN-125', 'years_experience' => 5, 'availability_status' => 'available']);

        $booking = Booking::factory()->create();

        \Laravel\Sanctum\Sanctum::actingAs($user);

        $this->postJson('/api/practitioner/sync/visits', [
                'visits' => [
                    ['booking_id' => $booking->id, 'check_in_time' => now()->toDateTimeString()],
                ],
            ])->assertStatus(201);

        $this->assertDatabaseCount('visits', 1);
    }
}
