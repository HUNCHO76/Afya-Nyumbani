<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_escalations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('practitioner_id')->constrained()->onDelete('cascade');
            $table->text('escalation_reason')->nullable();
            $table->timestamp('escalation_sent_at');
            $table->foreignId('responding_personnel_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->enum('resolution_status', ['pending', 'addressed', 'escalated_to_emergency'])->default('pending');
            $table->timestamps();

            $table->index('visit_id');
            $table->index('client_id');
            $table->index('practitioner_id');
            $table->index('resolution_status');
            $table->index('escalation_sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_escalations');
    }
};
