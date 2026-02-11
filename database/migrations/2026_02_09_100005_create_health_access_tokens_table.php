<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('token_hash')->unique();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('authorized_entity_id');
            $table->string('authorized_entity_type')->comment('specialist, insurance, caregiver');
            $table->json('allowed_record_types')->default('[]')->comment('lab_results, prescriptions, medical_history, etc');
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->integer('access_limit')->nullable()->comment('null = unlimited');
            $table->integer('access_count')->default(0);
            $table->timestamps();

            $table->index('client_id');
            $table->index('authorized_entity_id');
            $table->index('expires_at');
            $table->index('revoked_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_access_tokens');
    }
};
