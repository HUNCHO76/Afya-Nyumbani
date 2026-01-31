<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition()
    {
        $client = Client::factory()->create();
        $service = Service::factory()->create();

        return [
            'client_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(rand(0,5))->toDateString(),
            'booking_time' => now()->addMinutes(rand(0, 300))->toTimeString(),
            'status' => 'pending',
            'payment_type' => 'cash',
        ];
    }
}
