<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practitioner_arrival_confirmations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('practitioner_id')->constrained()->onDelete('cascade');
            $table->timestamp('confirmation_sent_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->enum('confirmation_method', ['SMS', 'USSD', 'voice'])->default('SMS');
            $table->enum('status', ['pending', 'confirmed', 'timeout'])->default('pending');
            $table->json('response_metadata')->nullable();
            $table->timestamps();

            $table->index('visit_id');
            $table->index('client_id');
            $table->index('practitioner_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practitioner_arrival_confirmations');
    }
};
