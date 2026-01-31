<?php

namespace Database\Factories;

use App\Models\Vital;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

class VitalFactory extends Factory
{
    protected $model = Vital::class;

    public function definition()
    {
        $visit = Visit::factory()->create();

        return [
            'visit_id' => $visit->id,
            'blood_pressure_systolic' => $this->faker->numberBetween(100, 140),
            'blood_pressure_diastolic' => $this->faker->numberBetween(60, 90),
            'temperature' => $this->faker->randomFloat(1, 35.0, 40.0),
            'heart_rate' => $this->faker->numberBetween(50, 110),
            'sugar_level' => $this->faker->numberBetween(60, 180),
            'notes' => $this->faker->sentence(),
            'recorded_at' => now(),
            'recorded_by' => null,
        ];
    }
}
