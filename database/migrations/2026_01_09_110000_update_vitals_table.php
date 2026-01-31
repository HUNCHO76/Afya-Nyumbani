<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vitals', function (Blueprint $table) {
            // Add patient_id and recorded_by columns
            $table->foreignUuid('patient_id')->nullable()->after('visit_id')->constrained('patients')->nullOnDelete();
            $table->foreignId('recorded_by')->nullable()->after('patient_id')->constrained('users')->nullOnDelete();
            
            // Change visit_id to nullable since vitals can be recorded outside visits
            $table->foreignId('visit_id')->nullable()->change();
            
            // Add new vital sign columns
            $table->integer('blood_pressure_systolic')->nullable()->after('blood_pressure');
            $table->integer('blood_pressure_diastolic')->nullable()->after('blood_pressure_systolic');
            $table->integer('respiratory_rate')->nullable()->after('heart_rate');
            $table->integer('oxygen_saturation')->nullable()->after('respiratory_rate');
            $table->decimal('blood_glucose', 5, 1)->nullable()->after('sugar_level');
            $table->decimal('weight', 5, 1)->nullable()->after('blood_glucose');
            $table->decimal('height', 5, 1)->nullable()->after('weight');
            $table->text('notes')->nullable()->after('height');
            
            // Drop recorded_at in favor of created_at
            $table->dropColumn('recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vitals', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropForeign(['recorded_by']);
            $table->dropColumn([
                'patient_id',
                'recorded_by',
                'blood_pressure_systolic',
                'blood_pressure_diastolic',
                'respiratory_rate',
                'oxygen_saturation',
                'blood_glucose',
                'weight',
                'height',
                'notes',
            ]);
            $table->timestamp('recorded_at');
        });
    }
};
