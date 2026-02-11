<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VisitTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'practitioner_started_at',
        'client_start_confirmed_at',
        'practitioner_ended_at',
        'client_completion_confirmed_at',
        'duration_minutes',
        'notes',
    ];

    protected $casts = [
        'practitioner_started_at' => 'datetime',
        'client_start_confirmed_at' => 'datetime',
        'practitioner_ended_at' => 'datetime',
        'client_completion_confirmed_at' => 'datetime',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function isStarted(): bool
    {
        return $this->practitioner_started_at !== null;
    }

    public function isClientStartConfirmed(): bool
    {
        return $this->client_start_confirmed_at !== null;
    }

    public function isEnded(): bool
    {
        return $this->practitioner_ended_at !== null;
    }

    public function isClientCompletionConfirmed(): bool
    {
        return $this->client_completion_confirmed_at !== null;
    }

    public function getVerifiedDurationMinutes(): ?int
    {
        if (!$this->client_start_confirmed_at || !$this->client_completion_confirmed_at) {
            return null;
        }
        return $this->client_start_confirmed_at->diffInMinutes($this->client_completion_confirmed_at);
    }

    public function getTimeDiscrepancy(): ?int
    {
        if (!$this->isEnded() || !$this->isClientCompletionConfirmed()) {
            return null;
        }
        return $this->practitioner_ended_at->diffInMinutes($this->client_completion_confirmed_at);
    }
}
