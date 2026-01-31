<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVitalRequest extends FormRequest
{
    public function authorize()
    {
        // Further authorization in controller (practitioner ownership)
        return auth()->check();
    }

    public function rules()
    {
        return [
            'visit_id' => 'nullable|exists:visits,id',
            'blood_pressure' => 'nullable|string|max:20',
            'blood_pressure_systolic' => 'nullable|integer|min:0|max:300',
            'blood_pressure_diastolic' => 'nullable|integer|min:0|max:200',
            'temperature' => 'nullable|numeric|min:30|max:45',
            'heart_rate' => 'nullable|integer|min:0|max:300',
            'sugar_level' => 'nullable|numeric|min:0|max:1000',
            'notes' => 'nullable|string|max:2000',
            'recorded_at' => 'nullable|date',
        ];
    }
}
