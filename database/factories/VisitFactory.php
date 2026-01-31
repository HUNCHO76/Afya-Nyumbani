<?php

namespace Database\Factories;

use App\Models\Visit;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

class VisitFactory extends Factory
{
    protected $model = Visit::class;

    public function definition()
    {
        $booking = Booking::factory()->create();

        return [
            'booking_id' => $booking->id,
            'practitioner_id' => null,
            'check_in_time' => null,
            'check_out_time' => null,
            'visit_notes' => $this->faker->sentence(),
        ];
    }
}
