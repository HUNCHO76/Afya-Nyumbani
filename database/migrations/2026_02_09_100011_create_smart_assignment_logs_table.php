<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('smart_assignment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('recommended_practitioner_id')->constrained('practitioners')->onDelete('cascade');
            $table->foreignId('assigned_practitioner_id')->constrained('practitioners')->onDelete('cascade');
            $table->integer('match_score')->comment('0-100 percentage');
            $table->json('scoring_factors')->nullable()->comment('specialty_match, availability, ratings, proximity, etc');
            $table->timestamp('assignment_timestamp');
            $table->timestamps();

            $table->index('appointment_id');
            $table->index('recommended_practitioner_id');
            $table->index('assigned_practitioner_id');
            $table->index('match_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('smart_assignment_logs');
    }
};
