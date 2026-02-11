<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComfortReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'client_id',
        'practitioner_id',
        'comfort_rating',
        'safety_rating',
        'concern_description',
        'submitted_at',
        'resolution_status',
        'resolution_notes',
        'resolved_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
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

    public function getComfortLabel(): string
    {
        return match($this->comfort_rating) {
            1 => 'Very Uncomfortable',
            2 => 'Uncomfortable',
            3 => 'Neutral',
            4 => 'Comfortable',
            5 => 'Very Comfortable',
            default => 'Unknown',
        };
    }

    public function getSafetyLabel(): string
    {
        return match($this->safety_rating) {
            1 => 'Very Unsafe',
            2 => 'Unsafe',
            3 => 'Neutral',
            4 => 'Safe',
            5 => 'Very Safe',
            default => 'Unknown',
        };
    }

    public function isPending(): bool
    {
        return $this->resolution_status === 'pending';
    }
}
