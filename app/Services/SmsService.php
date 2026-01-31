<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SmsService
{
    protected $apiKey;
    protected $apiSecret;
    protected $senderId;
    protected $apiUrl;

    public function __construct()
    {
        // Africa's Talking API configuration (common in Tanzania)
        $this->apiKey = config('services.sms.api_key', env('SMS_API_KEY'));
        $this->apiSecret = config('services.sms.api_secret', env('SMS_API_SECRET'));
        $this->senderId = config('services.sms.sender_id', env('SMS_SENDER_ID', 'AFYA'));

        $username = config('services.sms.username', env('SMS_USERNAME', 'sandbox'));
        $configuredUrl = config('services.sms.api_url', env('SMS_API_URL'));

        // Auto-select correct Africa's Talking endpoint based on username
        if (empty($configuredUrl)) {
            $this->apiUrl = $username === 'sandbox'
                ? 'https://api.sandbox.africastalking.com/version1/messaging'
                : 'https://api.africastalking.com/version1/messaging';
        } else {
            // If sandbox username but live URL configured, override to sandbox URL
            if ($username === 'sandbox' && str_contains($configuredUrl, 'africastalking.com') && !str_contains($configuredUrl, 'sandbox')) {
                $this->apiUrl = 'https://api.sandbox.africastalking.com/version1/messaging';
            } else {
                $this->apiUrl = $configuredUrl;
            }
        }
    }

    /**
     * Send SMS to a phone number
     * 
     * @param string $phoneNumber
     * @param string $message
     * @return bool
     */
    public function sendSms(string $phoneNumber, string $message): bool
    {
        try {
            // Format phone number (ensure it starts with country code)
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);

            // Log SMS attempt
            Log::info('Sending SMS', [
                'phone' => $formattedPhone,
                'message' => $message
            ]);

            // If no API key configured, just log and return success (for development)
            if (empty($this->apiKey)) {
                Log::warning('SMS API not configured. Message would be sent to: ' . $formattedPhone . ' - Message: ' . $message);
                return true;
            }

            // Send SMS via Africa's Talking or your preferred SMS gateway
            $username = config('services.sms.username', 'sandbox');
            
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'apiKey' => $this->apiKey,
                'Accept' => 'application/json'
            ])->asForm()->post($this->apiUrl, [
                'username' => $username,
                'to' => $formattedPhone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info('SMS sent successfully', [
                    'phone' => $formattedPhone,
                    'response' => $response->json() ?? []
                ]);
                return true;
            } else {
                Log::error('Failed to send SMS', [
                    'phone' => $formattedPhone,
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'headers_sent' => [
                        'apiKey' => substr($this->apiKey, 0, 10) . '...',
                        'username' => $username
                    ]
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('SMS sending exception', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send booking confirmation SMS
     */
    public function sendBookingConfirmation($booking): bool
    {
        $client = $booking->client;
        $service = $booking->service;
        $user = $client->user;

        $phone = $user->phone ?? $client->emergency_contact_phone;

        if (empty($phone)) {
            Log::warning('No phone number found for client', ['client_id' => $client->id]);
            return false;
        }

        $message = "Booking Confirmed!\n\n";
        $message .= "Service: {$service->name}\n";
        $message .= "Date: {$booking->booking_date}\n";
        $message .= "Time: {$booking->booking_time}\n";
        if (!empty($booking->location_address)) {
            $message .= "Location: {$booking->location_address}\n";
        }
        $message .= "Reference: #{$booking->id}\n\n";
        $message .= "Thank you for choosing Afya Nyumbani Care System.";

        return $this->sendSms($phone, $message);
    }

    /**
     * Send payment confirmation SMS
     */
    public function sendPaymentConfirmation($payment): bool
    {
        $booking = $payment->booking;
        $client = $booking->client;
        $user = $client->user;

        $phone = $user->phone ?? $client->emergency_contact_phone;

        if (empty($phone)) {
            return false;
        }

        $message = "Payment Confirmed!\n\n";
        $message .= "Booking #{$booking->id}\n";
        $message .= "Service: {$booking->service->name}\n";
        $message .= "Amount: TZS " . number_format($payment->amount) . "\n";
        $message .= "Payment Method: " . strtoupper($payment->payment_method) . "\n";
        
        if (!empty($payment->transaction_reference)) {
            $message .= "Control Number: {$payment->transaction_reference}\n";
        }
        
        if (!empty($booking->location_address)) {
            $message .= "Location: {$booking->location_address}\n";
        }
        
        $message .= "Status: PAID\n\n";
        $message .= "Thank you for your payment. Your booking is confirmed!";

        return $this->sendSms($phone, $message);
    }

    /**
     * Send payment reminder SMS
     */
    public function sendPaymentReminder($payment): bool
    {
        $booking = $payment->booking;
        $client = $booking->client;
        $user = $client->user;

        $phone = $user->phone ?? $client->emergency_contact_phone;

        if (empty($phone)) {
            return false;
        }

        $message = "Payment Reminder\n\n";
        $message .= "Booking #{$booking->id}\n";
        $message .= "Amount: TZS " . number_format($payment->amount) . "\n";
        $message .= "Payment Method: " . ucfirst($payment->payment_method) . "\n\n";
        $message .= "Please complete your payment to confirm your booking.";

        return $this->sendSms($phone, $message);
    }

    /**
     * Format phone number to international format
     * Assumes Tanzania (+255) if no country code provided
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove any spaces, dashes, or parentheses
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);

        // If starts with 0, replace with +255 (Tanzania)
        if (substr($phone, 0, 1) === '0') {
            $phone = '+255' . substr($phone, 1);
        }

        // If doesn't start with +, add +255
        if (substr($phone, 0, 1) !== '+') {
            $phone = '+255' . $phone;
        }

        return $phone;
    }
}
