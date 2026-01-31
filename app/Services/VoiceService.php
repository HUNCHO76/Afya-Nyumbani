<?php

namespace App\Services;

use AfricasTalking\SDK\AfricasTalking;
use Illuminate\Support\Facades\Log;

class VoiceService
{
    protected string $username;
    protected string $apiKey;

    public function __construct()
    {
        $this->username = config('services.voice.username', env('VOICE_USERNAME', 'sandbox'));
        $this->apiKey = config('services.voice.api_key', env('VOICE_API_KEY', ''));
    }

    public function makeCall(string $phoneNumber, string $from): bool
    {
        try {
            if (empty($this->apiKey)) {
                Log::warning('Voice API not configured. Skipping call.', [
                    'phone' => $phoneNumber,
                    'from' => $from,
                ]);
                return true;
            }

            if (empty($phoneNumber)) {
                $phoneNumber = config('services.voice.default_phone', '+255686081750');
            }

            $AT = new AfricasTalking($this->username, $this->apiKey);
            $voice = $AT->voice();
            $voice->call([
                'to' => [$phoneNumber],
                'from' => $from,
            ]);

            Log::info('Voice call initiated', [
                'phone' => $phoneNumber,
                'from' => $from,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Voice call failed', [
                'phone' => $phoneNumber,
                'from' => $from,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
