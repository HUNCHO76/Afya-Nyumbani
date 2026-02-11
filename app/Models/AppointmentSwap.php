<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AppointmentSwap extends Model
{
    use HasFactory;

    protected $fillable = [
        'initiator_practitioner_id',
        'responder_practitioner_id',
        'appointment_id',
        'swap_reason',
        'requested_at',
        'responded_at',
        'status',
        'approval_notes',
        'completed_at',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'responded_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(Practitioner::class, 'initiator_practitioner_id');
    }

    public function responder(): BelongsTo
    {
        return $this->belongsTo(Practitioner::class, 'responder_practitioner_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }

    public function getResponseTimeMinutes(): ?int
    {
        if (!$this->requested_at || !$this->responded_at) {
            return null;
        }
        return $this->requested_at->diffInMinutes($this->responded_at);
    }
}
