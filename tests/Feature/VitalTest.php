<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Practitioner;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VitalTest extends TestCase
{
    use RefreshDatabase;

    public function test_practitioner_can_record_vitals_for_assigned_visit()
    {
        // Seed minimal data
        /** @var \App\Models\User $user */
        $user = User::factory()->create(['role' => 'practitioner']);
        $practitioner = Practitioner::create([
            'user_id' => $user->id,
            'specialization' => 'Nurse',
            'license_number' => 'RN-TEST-001',
            'years_experience' => 2,
            'availability_status' => 'available',
        ]);

        $service = \App\Models\Service::create(['name' => 'Test Service', 'price' => 1000]);
        $clientUser = User::factory()->create(['role' => 'client']);
        $client = \App\Models\Client::create(['user_id' => $clientUser->id]);

        $booking = Booking::create([
            'client_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->toDateString(),
            'booking_time' => now()->toTimeString(),
            'status' => 'pending',
            'assigned_practitioner_id' => $practitioner->id,
        ]);

        $visit = Visit::create(['booking_id' => $booking->id, 'practitioner_id' => $practitioner->id]);

        $this->actingAs($user)
            ->post(route('visits.vitals.store', ['visit' => $visit->id]), [
                'visit_id' => $visit->id,
                'temperature' => 36.7,
                'heart_rate' => 78,
                'blood_pressure_systolic' => 120,
                'blood_pressure_diastolic' => 80,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('vitals', [
            'visit_id' => $visit->id,
            'temperature' => '36.7',
            'heart_rate' => '78',
        ]);
    }

    public function test_practitioner_cannot_record_vitals_for_other_practitioner_visit()
    {
        /** @var \App\Models\User $user */
        $user = User::factory()->create(['role' => 'practitioner']);
        $otherUser = User::factory()->create(['role' => 'practitioner']);

        $practitioner = Practitioner::create(['user_id' => $user->id, 'specialization' => 'Nurse', 'license_number' => 'RN-1', 'years_experience' => 1, 'availability_status' => 'available']);
        $otherPractitioner = Practitioner::create(['user_id' => $otherUser->id, 'specialization' => 'Nurse', 'license_number' => 'RN-2', 'years_experience' => 1, 'availability_status' => 'available']);

        $service = \App\Models\Service::create(['name' => 'Other Service', 'price' => 500]);
        $clientUser = User::factory()->create(['role' => 'client']);
        $client = \App\Models\Client::create(['user_id' => $clientUser->id]);

        $booking = Booking::create([
            'client_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->toDateString(),
            'booking_time' => now()->toTimeString(),
            'status' => 'pending',
            'assigned_practitioner_id' => $otherPractitioner->id,
        ]);

        $visit = Visit::create(['booking_id' => $booking->id, 'practitioner_id' => $otherPractitioner->id]);

        $this->actingAs($user)
            ->post(route('visits.vitals.store', ['visit' => $visit->id]), [
                'visit_id' => $visit->id,
                'temperature' => 36.5,
            ])
            ->assertStatus(403);
    }
}
