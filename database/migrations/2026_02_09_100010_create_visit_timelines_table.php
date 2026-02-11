<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->onDelete('cascade');
            $table->timestamp('practitioner_started_at')->nullable();
            $table->timestamp('client_start_confirmed_at')->nullable();
            $table->timestamp('practitioner_ended_at')->nullable();
            $table->timestamp('client_completion_confirmed_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('visit_id');
            $table->index('practitioner_started_at');
            $table->index('client_start_confirmed_at');
            $table->index('practitioner_ended_at');
            $table->index('client_completion_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_timelines');
    }
};
