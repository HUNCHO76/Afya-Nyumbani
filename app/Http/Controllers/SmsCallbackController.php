<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Service;
use App\Models\Booking;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SmsCallbackController extends Controller
{
    protected $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Handle incoming SMS from Africa's Talking
     */
    public function handleIncoming(Request $request)
    {
        // Log incoming SMS
        Log::info('Incoming SMS received', $request->all());

        $from = $request->input('from');
        $to = $request->input('to');
        $text = trim($request->input('text', ''));
        $linkId = $request->input('linkId');
        $date = $request->input('date');

        if (empty($from) || empty($text)) {
            Log::warning('Invalid SMS request - missing from or text', [
                'from' => $from,
                'text' => $text
            ]);
            return response('Invalid request', 400);
        }

        Log::info('Processing SMS', [
            'from' => $from,
            'text' => $text
        ]);

        // Find user by phone number
        $user = $this->findUserByPhone($from);
        
        // Check if it's a registration command
        $textUpper = strtoupper($text);
        if (str_starts_with($textUpper, 'NISAJILI')) {
            Log::info('Registration command detected', ['from' => $from, 'text' => $text]);
            return $this->handleRegistration($text, $from);
        }
        
        if (!$user || !$user->client) {
            $response = "Karibu Afya Nyumbani! Unahitaji kujisajili kwanza.\n\nTuma: NISAJILI [Jina lako] kwa 22983\nMfano: NISAJILI John Doe\n\nAu tembelea tovuti yetu.";
            $this->smsService->sendSms($from, $response);
            return response('OK', 200);
        }

        $client = $user->client;

        // Parse and handle command
        $response = $this->parseCommand($text, $client, $from);
        
        // Send response
        $this->smsService->sendSms($from, $response);

        return response('OK', 200);
    }

    /**
     * Handle user registration via SMS
     */
    protected function handleRegistration(string $text, string $phone): \Illuminate\Http\Response
    {
        Log::info('Starting registration process', ['text' => $text, 'phone' => $phone]);
        
        // Check if user already exists
        $existingUser = $this->findUserByPhone($phone);
        if ($existingUser && $existingUser->client) {
            $response = "Umeshajisajili tayari! Piga *384*80224# kwa huduma za Afya Nyumbani.\n\nAu tuma HELP kwa 22983 kwa maelekezo.";
            Log::info('User already registered, sending response', ['phone' => $phone]);
            $this->smsService->sendSms($phone, $response);
            return response('OK', 200);
        }

        // Extract name from message
        $parts = preg_split('/\s+/', trim($text), 2);
        Log::info('Extracted parts', ['parts' => $parts, 'count' => count($parts)]);
        
        if (count($parts) < 2 || empty(trim($parts[1]))) {
            $response = "Tafadhali tuma jina lako kamili.\n\nMfano: NISAJILI John Doe";
            Log::info('No name provided, sending instruction', ['phone' => $phone, 'response' => $response]);
            $smsSent = $this->smsService->sendSms($phone, $response);
            Log::info('SMS send result', ['sent' => $smsSent]);
            return response('OK', 200);
        }

        $name = trim($parts[1]);

        try {
            // Create user account
            $user = User::create([
                'name' => $name,
                'phone' => $phone,
                'email' => null, // SMS registration doesn't require email
                'password' => bcrypt(bin2hex(random_bytes(16))), // Random password
                'role' => 'client',
            ]);

            // Create client profile
            Client::create([
                'user_id' => $user->id,
            ]);

            // Send success message in Swahili
            $response = "Hongera {$name}!\n\nUmefanikiwa kujisajili. Piga *384*80224# kwa huduma za Afya Nyumbani.\n\nTuma HELP kwa 22983 kwa maelekezo zaidi.";
            $this->smsService->sendSms($phone, $response);

            Log::info('User registered via SMS', [
                'phone' => $phone,
                'name' => $name,
                'user_id' => $user->id
            ]);

            return response('OK', 200);
        } catch (\Exception $e) {
            Log::error('SMS registration failed', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);

            $response = "Samahani, tatizo limetokea. Tafadhali jaribu tena baadae au tembelea tovuti yetu.";
            $this->smsService->sendSms($phone, $response);
            
            return response('OK', 200);
        }
    }

    /**
     * Parse SMS command and generate response
     */
    protected function parseCommand(string $text, Client $client, string $phone): string
    {
        $text = strtoupper(trim($text));
        $parts = preg_split('/\s+/', $text);
        $command = $parts[0] ?? '';

        switch ($command) {
            case 'HELP':
            case 'MENU':
            case 'MSAADA':
                return $this->getHelpMessage();

            case 'SERVICES':
            case 'SERVICE':
            case 'HUDUMA':
                return $this->getServicesMessage();

            case 'STATUS':
                $bookingId = $parts[1] ?? null;
                return $this->getBookingStatus($bookingId, $client);

            case 'MYBOOKINGS':
            case 'BOOKINGS':
                return $this->getMyBookings($client);

            case 'LAST':
            case 'LATEST':
                return $this->getLatestBooking($client);

            case 'CANCEL':
                $bookingId = $parts[1] ?? null;
                return $this->cancelBooking($bookingId, $client);

            case 'BALANCE':
            case 'PAYMENT':
                return $this->getPaymentInfo($client);

            default:
                return "Unknown command. Send HELP to 22983 to see available commands.";
        }
    }

    /**
     * Get help message with available commands
     */
    protected function getHelpMessage(): string
    {
        return "Afya Nyumbani - Amri za SMS:\n\n" .
               "NISAJILI [Jina] - Jisajili\n" .
               "HELP/MSAADA - Onyesha amri\n" .
               "SERVICES/HUDUMA - Orodha ya huduma\n" .
               "STATUS [ID] - Angalia hali ya booking\n" .
               "MYBOOKINGS - Bookings zako\n" .
               "LAST - Booking ya hivi karibuni\n" .
               "CANCEL [ID] - Futa booking\n" .
               "BALANCE - Angalia malipo\n\n" .
               "USSD: *384*80224#\n" .
               "Mfano: Tuma 'STATUS 46' kwa 22983";
    }

    /**
     * Get list of services
     */
    protected function getServicesMessage(): string
    {
        $services = Service::take(5)->get();
        
        if ($services->isEmpty()) {
            return "No services available at the moment.";
        }

        $message = "Our Services:\n\n";
        foreach ($services as $service) {
            $message .= "• {$service->name}\n";
            $message .= "  TZS " . number_format($service->price) . " | {$service->duration} mins\n\n";
        }
        
        $message .= "Visit our website, use USSD, or send HELP to 22983 for more options.";
        
        return $message;
    }

    /**
     * Get booking status
     */
    protected function getBookingStatus(?string $bookingId, Client $client): string
    {
        if (!$bookingId) {
            return "Please provide booking ID. Example: Send 'STATUS 46' to 22983";
        }

        $booking = Booking::where('id', $bookingId)
            ->where('client_id', $client->id)
            ->with(['service', 'practitioner.user', 'payments'])
            ->first();

        if (!$booking) {
            return "Booking #{$bookingId} not found.";
        }

        $message = "Booking #{$booking->id}\n\n";
        $message .= "Service: {$booking->service->name}\n";
        $message .= "Date: {$booking->booking_date}\n";
        $message .= "Time: {$booking->booking_time}\n";
        
        if ($booking->location_address) {
            $message .= "Location: {$booking->location_address}\n";
        }
        
        if ($booking->practitioner) {
            $message .= "Practitioner: {$booking->practitioner->user->name}\n";
        }
        
        $message .= "Status: " . strtoupper($booking->status) . "\n";
        
        $payment = $booking->payments->first();
        if ($payment) {
            $message .= "Payment: " . strtoupper($payment->status) . "\n";
            if ($payment->status === 'paid') {
                $message .= "Amount Paid: TZS " . number_format($payment->amount);
            }
        }

        return $message;
    }

    /**
     * Get user's bookings
     */
    protected function getMyBookings(Client $client): string
    {
        $bookings = Booking::where('client_id', $client->id)
            ->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->take(5)
            ->with('service')
            ->get();

        if ($bookings->isEmpty()) {
            return "You have no bookings yet. Use USSD, website, or send SERVICES to 22983 to book a service.";
        }

        $message = "Your Recent Bookings:\n\n";
        foreach ($bookings as $booking) {
            $message .= "#{$booking->id} - {$booking->service->name}\n";
            $message .= "{$booking->booking_date} at {$booking->booking_time}\n";
            $message .= "Status: " . strtoupper($booking->status) . "\n\n";
        }

        $message .= "Reply STATUS [ID] for details.";

        return $message;
    }

    /**
     * Get latest booking
     */
    protected function getLatestBooking(Client $client): string
    {
        $booking = Booking::where('client_id', $client->id)
            ->orderBy('created_at', 'desc')
            ->with(['service', 'practitioner.user'])
            ->first();

        if (!$booking) {
            return "You have no bookings yet.";
        }

        $message = "Latest Booking:\n\n";
        $message .= "#{$booking->id} - {$booking->service->name}\n";
        $message .= "Date: {$booking->booking_date}\n";
        $message .= "Time: {$booking->booking_time}\n";
        
        if ($booking->location_address) {
            $message .= "Location: {$booking->location_address}\n";
        }
        
        $message .= "Status: " . strtoupper($booking->status) . "\n";
        
        if ($booking->practitioner) {
            $message .= "Practitioner: {$booking->practitioner->user->name}";
        }

        return $message;
    }

    /**
     * Cancel a booking
     */
    protected function cancelBooking(?string $bookingId, Client $client): string
    {
        if (!$bookingId) {
            return "Please provide booking ID. Example: Send 'CANCEL 46' to 22983";
        }

        $booking = Booking::where('id', $bookingId)
            ->where('client_id', $client->id)
            ->first();

        if (!$booking) {
            return "Booking #{$bookingId} not found.";
        }

        if ($booking->status === 'cancelled') {
            return "Booking #{$bookingId} is already cancelled.";
        }

        if ($booking->status === 'completed') {
            return "Cannot cancel completed booking #{$bookingId}.";
        }

        $booking->status = 'cancelled';
        $booking->save();

        return "Booking #{$bookingId} has been cancelled successfully.\n\n" .
               "Service: {$booking->service->name}\n" .
               "Date: {$booking->booking_date} at {$booking->booking_time}\n\n" .
               "If you paid, refund will be processed within 3-5 business days.";
    }

    /**
     * Get payment information
     */
    protected function getPaymentInfo(Client $client): string
    {
        $pendingBookings = Booking::where('client_id', $client->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereHas('payments', function ($query) {
                $query->where('status', '!=', 'paid');
            })
            ->with(['service', 'payments'])
            ->get();

        if ($pendingBookings->isEmpty()) {
            return "You have no pending payments. All bookings are paid!";
        }

        $message = "Pending Payments:\n\n";
        $total = 0;

        foreach ($pendingBookings as $booking) {
            $payment = $booking->payments->first();
            if ($payment && $payment->status !== 'paid') {
                $message .= "Booking #{$booking->id}\n";
                $message .= "{$booking->service->name}\n";
                $message .= "Amount: TZS " . number_format($booking->service->price) . "\n\n";
                $total += $booking->service->price;
            }
        }

        $message .= "Total Due: TZS " . number_format($total);

        return $message;
    }

    /**
     * Find user by phone number
     */
    protected function findUserByPhone(string $phone): ?User
    {
        // Format phone number
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
        
        if (substr($phone, 0, 1) === '0') {
            $phone = '+255' . substr($phone, 1);
        }
        
        if (substr($phone, 0, 1) !== '+') {
            $phone = '+255' . $phone;
        }

        return User::where('phone', $phone)->with('client')->first();
    }
}
