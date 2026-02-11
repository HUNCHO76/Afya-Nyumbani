<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_swaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('initiator_practitioner_id')->constrained('practitioners')->onDelete('cascade');
            $table->foreignId('responder_practitioner_id')->nullable()->constrained('practitioners')->onDelete('set null');
            $table->foreignUuid('appointment_id')->constrained()->onDelete('cascade');
            $table->text('swap_reason')->nullable();
            $table->timestamp('requested_at');
            $table->timestamp('responded_at')->nullable();
            $table->enum('status', ['pending', 'accepted', 'declined', 'completed'])->default('pending');
            $table->text('approval_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('initiator_practitioner_id');
            $table->index('responder_practitioner_id');
            $table->index('appointment_id');
            $table->index('status');
            $table->index('requested_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_swaps');
    }
};
