<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_id',
        'practitioner_id',
        'service_type',
        'appointment_date',
        'appointment_time',
        'duration_minutes',
        'status',
        'notes',
        'location_address',
        'location_latitude',
        'location_longitude',
        'payment_method',
        'payment_status',
        'payment_amount',
        'payment_reference',
        'mobile_money_provider',
        'mobile_money_phone',
        'insurance_provider',
        'insurance_policy_number',
        'insurance_holder_name',
        'cancellation_reason',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'location_latitude' => 'decimal:7',
        'location_longitude' => 'decimal:7',
        'payment_amount' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(PractitionerProfile::class, 'practitioner_id');
    }
}
