<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CareCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'client_id',
        'practitioner_id',
        'code_hash',
        'generated_at',
        'confirmed_at',
        'expires_at',
        'confirmation_method',
        'status',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'expires_at' => 'datetime',
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

    public function isValid(): bool
    {
        return $this->status === 'active' 
            && $this->expires_at->isFuture();
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed' && $this->confirmed_at !== null;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
