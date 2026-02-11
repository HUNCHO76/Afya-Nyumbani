<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmergencyEscalation extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'client_id',
        'practitioner_id',
        'escalation_reason',
        'escalation_sent_at',
        'responding_personnel_id',
        'resolved_at',
        'resolution_notes',
        'resolution_status',
    ];

    protected $casts = [
        'escalation_sent_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(Practitioner::class);
    }

    public function respondingPersonnel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responding_personnel_id');
    }

    public function isPending(): bool
    {
        return $this->resolution_status === 'pending';
    }

    public function getResponseTimeMinutes(): ?int
    {
        if (!$this->escalation_sent_at || !$this->resolved_at) {
            return null;
        }
        return $this->escalation_sent_at->diffInMinutes($this->resolved_at);
    }
}
