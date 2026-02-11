<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TokenAccessLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'health_access_token_id',
        'accessed_by_id',
        'accessed_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
    ];

    public function token(): BelongsTo
    {
        return $this->belongsTo(HealthAccessToken::class, 'health_access_token_id');
    }

    public function accessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accessed_by_id');
    }
}
