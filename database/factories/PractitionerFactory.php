<?php

namespace Database\Factories;

use App\Models\Practitioner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PractitionerFactory extends Factory
{
    protected $model = Practitioner::class;

    public function definition()
    {
        $user = User::factory()->create(['role' => 'practitioner']);

        return [
            'user_id' => $user->id,
            'specialization' => $this->faker->randomElement(['General Nurse','Physiotherapist','Wound Care']),
            'license_number' => 'RN-' . $this->faker->unique()->numerify('####'),
            'years_experience' => $this->faker->numberBetween(1,20),
            'availability_status' => 'available',
        ];
    }
}
