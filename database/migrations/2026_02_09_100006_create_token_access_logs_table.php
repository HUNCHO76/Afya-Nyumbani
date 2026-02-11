<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('token_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('health_access_token_id')->constrained()->onDelete('cascade');
            $table->foreignId('accessed_by_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('accessed_at');
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index('health_access_token_id');
            $table->index('accessed_by_id');
            $table->index('accessed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('token_access_logs');
    }
};
