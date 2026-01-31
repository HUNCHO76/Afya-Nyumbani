<?php

namespace Database\Seeders;

use App\Models\Visit;
use App\Models\Booking;
use App\Models\Patient;
use App\Models\Practitioner;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VisitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = Patient::all();
        $practitioners = Practitioner::all();
        $bookings = Booking::all();

        if ($patients->isEmpty() || $practitioners->isEmpty() || $bookings->isEmpty()) {
            $this->command->warn('VisitSeeder: Skipped - Missing patients, practitioners, or bookings. Run those seeders first.');
            return;
        }

        $visits = [];
        $bookingIndex = 0;

        foreach ($patients->take(8) as $index => $patient) {
            // Create 2-4 visits per patient
            $visitCount = rand(2, 4);
            
            for ($i = 0; $i < $visitCount; $i++) {
                // Get or cycle through bookings
                if ($bookingIndex >= count($bookings)) {
                    break;
                }
                
                $booking = $bookings[$bookingIndex];
                $practitioner = $practitioners->random();
                
                // Create visit dates spread across the last 2 months
                $visitDate = now()->subDays(rand(0, 60));
                
                $visit = Visit::create([
                    'booking_id' => $booking->id,
                    'patient_id' => $patient->id,
                    'practitioner_id' => $practitioner->id,
                    'check_in_time' => $visitDate->copy()->setHour(rand(8, 16)),
                    'check_out_time' => $visitDate->copy()->setHour(rand(17, 18)),
                    'visit_notes' => 'Visit conducted as scheduled. Patient responding well to treatment.',
                ]);
                
                $visits[] = $visit;
                $bookingIndex++;
            }
        }

        $this->command->info('VisitSeeder: ' . count($visits) . ' visits created successfully!');
    }
}
