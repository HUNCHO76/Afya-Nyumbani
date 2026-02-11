<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PostVisitReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'practitioner_id',
        'findings',
        'treatments_provided',
        'recommendations',
        'follow_up_needed',
        'follow_up_urgency',
        'follow_up_interval_days',
        'submitted_at',
        'auto_scheduled_appointment_id',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'follow_up_needed' => 'boolean',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(Practitioner::class);
    }

    public function autoScheduledAppointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'auto_scheduled_appointment_id');
    }

    public function hasFollowUp(): bool
    {
        return $this->follow_up_needed === true;
    }

    public function getFollowUpUrgencyLabel(): string
    {
        return match($this->follow_up_urgency) {
            'routine' => 'Routine Follow-up',
            'urgent' => 'Urgent Follow-up Required',
            'critical' => 'Critical - Immediate Follow-up',
            default => 'Unknown',
        };
    }
}
