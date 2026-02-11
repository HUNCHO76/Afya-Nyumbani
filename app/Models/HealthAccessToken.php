<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HealthAccessToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token_hash',
        'client_id',
        'authorized_entity_id',
        'authorized_entity_type',
        'allowed_record_types',
        'created_at',
        'expires_at',
        'revoked_at',
        'access_limit',
        'access_count',
    ];

    protected $casts = [
        'allowed_record_types' => 'array',
        'created_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(TokenAccessLog::class);
    }

    public function isActive(): bool
    {
        return !$this->revoked_at 
            && (!$this->expires_at || $this->expires_at->isFuture())
            && (!$this->access_limit || $this->access_count < $this->access_limit);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function logAccess(User $accessor): void
    {
        $this->accessLogs()->create([
            'accessed_by_id' => $accessor->id,
            'accessed_at' => now(),
            'ip_address' => request()->ip(),
        ]);

        $this->increment('access_count');
    }
}
