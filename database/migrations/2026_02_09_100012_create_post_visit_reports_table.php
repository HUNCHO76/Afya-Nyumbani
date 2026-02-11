<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_visit_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->onDelete('cascade');
            $table->foreignId('practitioner_id')->constrained()->onDelete('cascade');
            $table->longText('findings');
            $table->longText('treatments_provided');
            $table->longText('recommendations');
            $table->boolean('follow_up_needed')->default(false);
            $table->enum('follow_up_urgency', ['routine', 'urgent', 'critical'])->nullable();
            $table->integer('follow_up_interval_days')->nullable();
            $table->timestamp('submitted_at');
            $table->foreignUuid('auto_scheduled_appointment_id')->nullable()->constrained('appointments')->onDelete('set null');
            $table->timestamps();

            $table->index('visit_id');
            $table->index('practitioner_id');
            $table->index('follow_up_needed');
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_visit_reports');
    }
};
