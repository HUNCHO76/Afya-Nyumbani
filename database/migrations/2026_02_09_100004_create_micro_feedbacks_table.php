<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('micro_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('practitioner_id')->constrained()->onDelete('cascade');
            $table->integer('quality_rating')->comment('1-4 scale: Poor, Fair, Good, Excellent');
            $table->text('comments')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamp('practitioner_acknowledged_at')->nullable();
            $table->timestamps();

            $table->index('visit_id');
            $table->index('client_id');
            $table->index('practitioner_id');
            $table->index('submitted_at');
            $table->index('quality_rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('micro_feedbacks');
    }
};
