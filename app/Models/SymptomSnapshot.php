<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SymptomSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'client_id',
        'appointment_id',
        'pain_level',
        'temperature',
        'energy_level',
        'recent_medication',
        'new_concerns',
        'submitted_at',
        'metadata',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'recent_medication' => 'boolean',
        'metadata' => 'array',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function getHealthStatusSummary(): string
    {
        $summary = [];
        
        if ($this->pain_level) {
            $summary[] = "Pain level: {$this->pain_level}/10";
        }
        if ($this->temperature) {
            $summary[] = "Temperature: {$this->temperature}";
        }
        if ($this->energy_level) {
            $summary[] = "Energy: {$this->energy_level}";
        }
        
        return implode(', ', $summary);
    }
}
