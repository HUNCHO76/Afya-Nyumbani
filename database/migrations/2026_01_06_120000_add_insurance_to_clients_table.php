<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('insurance_provider')->nullable()->after('emergency_contact_phone');
            $table->string('insurance_number')->nullable()->after('insurance_provider');
            $table->enum('insurance_status', ['active', 'inactive', 'pending'])->default('inactive')->after('insurance_number');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['insurance_provider', 'insurance_number', 'insurance_status']);
        });
    }
};
