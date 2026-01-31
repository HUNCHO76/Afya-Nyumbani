<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition()
    {
        $user = User::factory()->create(['role' => 'client']);

        return [
            'user_id' => $user->id,
            'date_of_birth' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'address' => $this->faker->address(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'medical_notes' => $this->faker->sentence(),
            'insurance_provider' => null,
            'insurance_number' => null,
            'insurance_status' => 'inactive',
        ];
    }
}
