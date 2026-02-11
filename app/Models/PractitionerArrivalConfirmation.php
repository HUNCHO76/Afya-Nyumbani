<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PractitionerArrivalConfirmation extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'client_id',
        'practitioner_id',
        'confirmation_sent_at',
        'confirmed_at',
        'confirmation_method',
        'status',
        'response_metadata',
    ];

    protected $casts = [
        'confirmation_sent_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'response_metadata' => 'array',
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

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed' && $this->confirmed_at !== null;
    }

    public function isTimedOut(): bool
    {
        return $this->status === 'timeout' && $this->confirmation_sent_at->addMinutes(5)->isPast();
    }
}
