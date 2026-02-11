<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comfort_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('practitioner_id')->constrained()->onDelete('cascade');
            $table->integer('comfort_rating')->comment('1-5 scale');
            $table->integer('safety_rating')->comment('1-5 scale');
            $table->text('concern_description')->nullable();
            $table->timestamp('submitted_at');
            $table->enum('resolution_status', ['pending', 'addressed'])->default('pending');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('visit_id');
            $table->index('client_id');
            $table->index('practitioner_id');
            $table->index('submitted_at');
            $table->index('resolution_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comfort_reports');
    }
};
