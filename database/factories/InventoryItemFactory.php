<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryItemFactory extends Factory
{
    protected $model = InventoryItem::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word(),
            'category' => $this->faker->randomElement(['Supplies','PPE','Equipment']),
            'quantity' => $this->faker->numberBetween(1, 500),
            'reorder_level' => $this->faker->numberBetween(1, 50),
        ];
    }
}
