<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Practitioner;
use App\Models\Service;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\InventoryItem;
use App\Models\Notification;
use App\Models\InsuranceApproval;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@afya.com',
            'phone' => '+254700000001',
            'role' => 'super_admin',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@afya.com',
            'phone' => '+254700000002',
            'role' => 'admin',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create Inventory Officer
        $inventoryOfficer = User::create([
            'name' => 'John Inventory',
            'email' => 'inventory@afya.com',
            'phone' => '+254700000003',
            'role' => 'inventory_officer',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create Finance Officer
        $financeOfficer = User::create([
            'name' => 'Jane Finance',
            'email' => 'finance@afya.com',
            'phone' => '+254700000004',
            'role' => 'finance_officer',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create Practitioners
        $practitionerUser1 = User::create([
            'name' => 'Dr. Sarah Johnson',
            'email' => 'sarah@afya.com',
            'phone' => '+254711111111',
            'role' => 'practitioner',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $practitioner1 = Practitioner::create([
            'user_id' => $practitionerUser1->id,
            'specialization' => 'General Nurse',
            'license_number' => 'RN-2024-0001',
            'years_experience' => 5,
            'availability_status' => 'available',
        ]);

        $practitionerUser2 = User::create([
            'name' => 'Dr. Michael Omondi',
            'email' => 'michael@afya.com',
            'phone' => '+254722222222',
            'role' => 'practitioner',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $practitioner2 = Practitioner::create([
            'user_id' => $practitionerUser2->id,
            'specialization' => 'Physiotherapist',
            'license_number' => 'PT-2024-0002',
            'years_experience' => 8,
            'availability_status' => 'available',
        ]);

        // Create Clients
        $clientUser1 = User::create([
            'name' => 'Mary Wanjiku',
            'email' => 'mary@client.com',
            'phone' => '+254733333333',
            'role' => 'client',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $client1 = Client::create([
            'user_id' => $clientUser1->id,
            'date_of_birth' => '1985-03-15',
            'gender' => 'female',
            'address' => 'Nairobi, Westlands',
            'emergency_contact_name' => 'John Wanjiku',
            'emergency_contact_phone' => '+254744444444',
            'medical_notes' => 'Diabetic, requires regular monitoring',
            'insurance_provider' => 'NHIF',
            'insurance_number' => 'NHIF-2024-001234',
            'insurance_status' => 'active',
        ]);

        $clientUser2 = User::create([
            'name' => 'James Mwangi',
            'email' => 'james@client.com',
            'phone' => '+254755555555',
            'role' => 'client',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $client2 = Client::create([
            'user_id' => $clientUser2->id,
            'date_of_birth' => '1970-08-22',
            'gender' => 'male',
            'address' => 'Nairobi, Karen',
            'emergency_contact_name' => 'Grace Mwangi',
            'emergency_contact_phone' => '+254766666666',
            'medical_notes' => 'Post-surgery recovery',
            'insurance_provider' => 'Jubilee Insurance',
            'insurance_number' => 'JUB-2024-567890',
            'insurance_status' => 'active',
        ]);

        // Create additional client without insurance
        $clientUser3 = User::create([
            'name' => 'Peter Kamau',
            'email' => 'peter@client.com',
            'phone' => '+254777777777',
            'role' => 'client',
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $client3 = Client::create([
            'user_id' => $clientUser3->id,
            'date_of_birth' => '1992-11-10',
            'gender' => 'male',
            'address' => 'Nairobi, South C',
            'emergency_contact_name' => 'Lucy Kamau',
            'emergency_contact_phone' => '+254788888888',
            'medical_notes' => 'Regular check-ups needed',
            'insurance_provider' => null,
            'insurance_number' => null,
            'insurance_status' => 'inactive',
        ]);

        // Create Services
        $service1 = Service::create([
            'name' => 'Home Nursing Care',
            'description' => 'Professional nursing care at home',
            'price' => 3000.00,
        ]);

        $service2 = Service::create([
            'name' => 'Physiotherapy Session',
            'description' => 'Physical therapy and rehabilitation',
            'price' => 2500.00,
        ]);

        $service3 = Service::create([
            'name' => 'Wound Dressing',
            'description' => 'Professional wound care and dressing',
            'price' => 1500.00,
        ]);

        $service4 = Service::create([
            'name' => 'Blood Pressure Monitoring',
            'description' => 'Regular blood pressure checks',
            'price' => 800.00,
        ]);

        $service5 = Service::create([
            'name' => 'Blood Sugar Testing',
            'description' => 'Diabetes monitoring and management',
            'price' => 1200.00,
        ]);

        // Create Bookings with different payment types
        
        // Booking 1: Insurance payment (approved)
        $booking1 = Booking::create([
            'client_id' => $client1->id,
            'service_id' => $service1->id,
            'booking_date' => now()->addDays(1),
            'booking_time' => '10:00:00',
            'status' => 'confirmed',
            'assigned_practitioner_id' => $practitioner1->id,
            'payment_type' => 'insurance',
            'special_instructions' => 'Please call before arriving',
        ]);

        // Create approved insurance approval
        $insuranceApproval1 = InsuranceApproval::create([
            'booking_id' => $booking1->id,
            'provider' => 'NHIF',
            'insurance_number' => 'NHIF-2024-001234',
            'approval_status' => 'approved',
            'approved_by' => $financeOfficer->id,
            'approved_at' => now()->subHours(2),
        ]);

        // Booking 2: Insurance payment (pending approval)
        $booking2 = Booking::create([
            'client_id' => $client2->id,
            'service_id' => $service2->id,
            'booking_date' => now()->addDays(2),
            'booking_time' => '14:00:00',
            'status' => 'pending',
            'assigned_practitioner_id' => $practitioner2->id,
            'payment_type' => 'insurance',
            'special_instructions' => 'Patient has mobility issues',
        ]);

        // Create pending insurance approval
        InsuranceApproval::create([
            'booking_id' => $booking2->id,
            'provider' => 'Jubilee Insurance',
            'insurance_number' => 'JUB-2024-567890',
            'approval_status' => 'pending',
        ]);

        // Booking 3: Cash payment (completed)
        $booking3 = Booking::create([
            'client_id' => $client3->id,
            'service_id' => $service3->id,
            'booking_date' => now()->addDays(3),
            'booking_time' => '09:00:00',
            'status' => 'confirmed',
            'assigned_practitioner_id' => $practitioner1->id,
            'payment_type' => 'cash',
        ]);

        // Booking 4: Insurance payment (rejected)
        $booking4 = Booking::create([
            'client_id' => $client1->id,
            'service_id' => $service5->id,
            'booking_date' => now()->addDays(-3),
            'booking_time' => '11:00:00',
            'status' => 'pending',
            'payment_type' => 'insurance',
            'special_instructions' => 'Need fasting blood sugar test',
        ]);

        // Create rejected insurance approval
        InsuranceApproval::create([
            'booking_id' => $booking4->id,
            'provider' => 'NHIF',
            'insurance_number' => 'NHIF-2024-001234',
            'approval_status' => 'rejected',
            'approved_by' => $financeOfficer->id,
            'approved_at' => now()->subDays(2),
            'rejection_reason' => 'Service not covered under current NHIF package. Please use cash payment.',
        ]);

        // Booking 5: Cash payment (pending)
        $booking5 = Booking::create([
            'client_id' => $client3->id,
            'service_id' => $service4->id,
            'booking_date' => now()->addDays(5),
            'booking_time' => '15:30:00',
            'status' => 'confirmed',
            'assigned_practitioner_id' => $practitioner2->id,
            'payment_type' => 'cash',
        ]);

        // Create Payments
        
        // Payment for approved insurance booking
        Payment::create([
            'booking_id' => $booking1->id,
            'client_id' => $client1->id,
            'insurance_approval_id' => $insuranceApproval1->id,
            'amount' => 3000.00,
            'payment_method' => 'insurance',
            'transaction_reference' => 'INS-' . rand(100000, 999999),
            'status' => 'completed',
            'paid_at' => now()->subHours(1),
        ]);

        // Payment for cash booking (M-Pesa)
        Payment::create([
            'booking_id' => $booking3->id,
            'client_id' => $client3->id,
            'amount' => 1500.00,
            'payment_method' => 'mpesa',
            'transaction_reference' => 'MPESA-' . rand(100000, 999999),
            'status' => 'completed',
            'paid_at' => now()->subHours(3),
        ]);

        // Payment for cash booking (pending - Tigo Pesa)
        Payment::create([
            'booking_id' => $booking5->id,
            'client_id' => $client3->id,
            'amount' => 800.00,
            'payment_method' => 'tigopesa',
            'transaction_reference' => null,
            'status' => 'pending',
            'paid_at' => null,
        ]);

        // Create Inventory Items
        InventoryItem::create([
            'name' => 'Medical Gloves',
            'category' => 'PPE',
            'quantity' => 500,
            'reorder_level' => 100,
        ]);

        InventoryItem::create([
            'name' => 'Bandages',
            'category' => 'Supplies',
            'quantity' => 200,
            'reorder_level' => 50,
        ]);

        InventoryItem::create([
            'name' => 'Thermometer',
            'category' => 'Equipment',
            'quantity' => 15,
            'reorder_level' => 5,
        ]);

        InventoryItem::create([
            'name' => 'Blood Pressure Monitor',
            'category' => 'Equipment',
            'quantity' => 8,
            'reorder_level' => 3,
        ]);

        // Create Notifications
        Notification::create([
            'user_id' => $clientUser1->id,
            'title' => 'Insurance Approved',
            'message' => 'Your insurance has been approved for Home Nursing Care booking scheduled for tomorrow at 10:00 AM',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $clientUser2->id,
            'title' => 'Insurance Approval Pending',
            'message' => 'Your insurance approval is being reviewed. You will be notified once processed.',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $clientUser1->id,
            'title' => 'Insurance Claim Rejected',
            'message' => 'Your insurance claim for Blood Sugar Testing has been rejected. Please contact finance department for details.',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $clientUser3->id,
            'title' => 'Payment Reminder',
            'message' => 'You have a pending payment of TZS 800 for Blood Pressure Monitoring. Please complete payment.',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $practitionerUser1->id,
            'title' => 'New Assignment',
            'message' => 'You have been assigned to Mary Wanjiku for Home Nursing Care tomorrow at 10:00 AM',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $financeOfficer->id,
            'title' => 'Insurance Approval Pending',
            'message' => 'New insurance approval request from James Mwangi (Jubilee Insurance) requires review',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $inventoryOfficer->id,
            'title' => 'Low Stock Alert',
            'message' => 'Bandages stock is running low. Current quantity: 200',
            'is_read' => false,
        ]);

        // Call additional seeders
        $this->call([
            PatientSeeder::class,
            VisitSeeder::class,
            VitalSeeder::class,
            InventoryUsageSeeder::class,
        ]);
    }
}
