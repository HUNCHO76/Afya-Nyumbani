<?php

namespace App\Services;

use AfricasTalking\SDK\AfricasTalking;
use Illuminate\Support\Facades\Log;

class AirtimeService
{
    protected string $username;
    protected string $apiKey;

    public function __construct()
    {
        $this->username = config('services.airtime.username', env('AIRTIME_USERNAME', 'sandbox'));
        $this->apiKey = config('services.airtime.api_key', env('AIRTIME_API_KEY', ''));
    }

    public function sendAirtime(string $phoneNumber, float $amount, string $currencyCode = 'TZS'): bool
    {
        try {
            if (empty($this->apiKey)) {
                Log::warning('Airtime API not configured. Skipping airtime reward.', [
                    'phone' => $phoneNumber,
                    'amount' => $amount,
                    'currency' => $currencyCode,
                ]);
                return true;
            }

            if (empty($phoneNumber)) {
                $phoneNumber = config('services.airtime.default_phone', '+255686081750');
            }

            $formattedPhone = $this->formatPhoneNumber($phoneNumber);

            // Ensure minimum airtime for TZS is 500
            if (strtoupper($currencyCode) === 'TZS' && $amount < 500) {
                $amount = 500;
            }

            $formattedAmount = strtoupper($currencyCode) . ' ' . number_format($amount, 2, '.', '');

            $AT = new AfricasTalking($this->username, $this->apiKey);
            $airtime = $AT->airtime();

            $recipients = [[
                'phoneNumber' => $formattedPhone,
                'amount' => $formattedAmount,
            ]];

            $results = $airtime->send([
                'recipients' => $recipients,
            ]);

            Log::info('Airtime sent', [
                'phone' => $formattedPhone,
                'amount' => $amount,
                'currency' => $currencyCode,
                'results' => $results,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send airtime', [
                'phone' => $phoneNumber,
                'amount' => $amount,
                'currency' => $currencyCode,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            return '+255' . substr($phone, 1);
        }

        if (!str_starts_with($phone, '+')) {
            return '+255' . $phone;
        }

        return $phone;
    }
}
