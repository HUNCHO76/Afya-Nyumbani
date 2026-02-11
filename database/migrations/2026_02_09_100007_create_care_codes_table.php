<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('care_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('practitioner_id')->constrained()->onDelete('cascade');
            $table->string('code_hash')->unique();
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->enum('confirmation_method', ['SMS', 'USSD', 'app'])->default('SMS');
            $table->enum('status', ['active', 'confirmed', 'expired', 'revoked'])->default('active');
            $table->timestamps();

            $table->index('visit_id');
            $table->index('client_id');
            $table->index('practitioner_id');
            $table->index('status');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('care_codes');
    }
};
