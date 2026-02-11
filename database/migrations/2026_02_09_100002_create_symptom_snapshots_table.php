<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('symptom_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('appointment_id')->constrained()->onDelete('cascade');
            $table->integer('pain_level')->nullable()->comment('1-10 scale');
            $table->enum('temperature', ['high', 'normal', 'low'])->nullable();
            $table->enum('energy_level', ['low', 'moderate', 'high'])->nullable();
            $table->boolean('recent_medication')->default(false);
            $table->text('new_concerns')->nullable();
            $table->timestamp('submitted_at');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('visit_id');
            $table->index('client_id');
            $table->index('appointment_id');
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('symptom_snapshots');
    }
};
