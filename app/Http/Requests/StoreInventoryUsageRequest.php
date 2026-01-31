<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryUsageRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity_used' => 'required|integer|min:1',
            'used_at' => 'nullable|date',
        ];
    }
}
