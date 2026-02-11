<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SmartAssignmentLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'recommended_practitioner_id',
        'assigned_practitioner_id',
        'match_score',
        'scoring_factors',
        'assignment_timestamp',
    ];

    protected $casts = [
        'scoring_factors' => 'array',
        'assignment_timestamp' => 'datetime',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function recommendedPractitioner(): BelongsTo
    {
        return $this->belongsTo(Practitioner::class, 'recommended_practitioner_id');
    }

    public function assignedPractitioner(): BelongsTo
    {
        return $this->belongsTo(Practitioner::class, 'assigned_practitioner_id');
    }

    public function wasRecommendationFollowed(): bool
    {
        return $this->recommended_practitioner_id === $this->assigned_practitioner_id;
    }
}
