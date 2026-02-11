<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MicroFeedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'client_id',
        'practitioner_id',
        'quality_rating',
        'comments',
        'submitted_at',
        'practitioner_acknowledged_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'practitioner_acknowledged_at' => 'datetime',
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

    public function isAcknowledged(): bool
    {
        return $this->practitioner_acknowledged_at !== null;
    }

    public function getRatingLabel(): string
    {
        return match($this->quality_rating) {
            1 => 'Poor',
            2 => 'Fair',
            3 => 'Good',
            4 => 'Excellent',
            default => 'Unknown',
        };
    }
}
