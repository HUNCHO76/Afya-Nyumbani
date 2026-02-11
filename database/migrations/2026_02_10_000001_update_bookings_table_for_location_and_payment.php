<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'location_address')) {
                $table->string('location_address')->nullable()->after('location_lng');
            }
        });

        DB::statement("ALTER TABLE bookings MODIFY COLUMN payment_type ENUM('insurance','cash','mobile_money') NOT NULL DEFAULT 'cash'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE bookings MODIFY COLUMN payment_type ENUM('insurance','cash') NOT NULL DEFAULT 'cash'");

        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'location_address')) {
                $table->dropColumn('location_address');
            }
        });
    }
};
