<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Service;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\SmsService;
use App\Services\AirtimeService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class UssdController extends Controller
{
    public function handle(Request $request)
    {
        // Read variables sent via POST from USSD gateway
        $sessionId = $request->input('sessionId', '');
        $serviceCode = $request->input('serviceCode', '');
        $phoneNumber = $request->input('phoneNumber', '');
        $text = trim((string) $request->input('text', ''));

        $segments = $text === '' ? [] : explode('*', $text);

        $user = $this->findUserByPhone($phoneNumber);
        if (!$user || !$user->client) {
            return response("END No account found for this number. Please register first.")
                ->header('Content-Type', 'text/plain');
        }

        $client = $user->client;

        // Main menu
        if (count($segments) === 0) {
            return response("CON Welcome to Afya Nyumbani\n1. Book a service\n2. Pay for a booking")
                ->header('Content-Type', 'text/plain');
        }

        // Booking flow
        if ($segments[0] === '1') {
            $services = Service::all();

            if ($services->isEmpty()) {
                return response("END No services available at the moment.")
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 1) {
                $menu = "CON Select a service:\n";
                foreach ($services as $index => $service) {
                    $menu .= ($index + 1) . ". " . $service->name . "\n";
                }
                return response(rtrim($menu))
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 2) {
                return response("CON Enter date (YYYY-MM-DD):")
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 3) {
                $date = $segments[2];
                if (!$this->isValidDate($date)) {
                    return response("END Invalid date. Use YYYY-MM-DD.")
                        ->header('Content-Type', 'text/plain');
                }
                return response("CON Enter time (HH:MM, 24h):")
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 4) {
                $time = $segments[3];
                if (!$this->isValidTime($time)) {
                    return response("END Invalid time. Use HH:MM (24h).")
                        ->header('Content-Type', 'text/plain');
                }
                return response("CON Select your city:\n1. Dar es Salaam\n2. Mbeya\n3. Kilimanjaro\n4. Dodoma\n5. Arusha\n6. Other")
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 5) {
                $cityChoice = $segments[4];
                $cityMap = [
                    '1' => ['name' => 'Dar es Salaam', 'areas' => ['Bungé', 'Kinondoni', 'Temeke', 'Ilala', 'Tazara', 'Mwenge', 'Ubungo', 'Upanga']],
                    '2' => ['name' => 'Mbeya', 'areas' => ['Mbeya City', 'Rungwe', 'Chunya', 'Kyela', 'Tukuyu']],
                    '3' => ['name' => 'Kilimanjaro', 'areas' => ['Moshi', 'Arusha Town', 'Hai', 'Rombo', 'Siha']],
                    '4' => ['name' => 'Dodoma', 'areas' => ['Dodoma City', 'Chamwino', 'Kondoa', 'Mpwapwa']],
                    '5' => ['name' => 'Arusha', 'areas' => ['Arusha City', 'Karatu', 'Monduli', 'Ngorongoro']],
                    '6' => ['name' => 'Other', 'areas' => []],
                ];

                if (!isset($cityMap[$cityChoice])) {
                    return response("END Invalid city selection.")
                        ->header('Content-Type', 'text/plain');
                }

                $city = $cityMap[$cityChoice];
                
                if ($cityChoice === '6') {
                    return response("CON Select payment method:\n1. M-Pesa\n2. Tigo Pesa\n3. Airtel Money")
                        ->header('Content-Type', 'text/plain');
                }

                $menu = "CON Select area in {$city['name']}:\n";
                foreach ($city['areas'] as $index => $area) {
                    $menu .= ($index + 1) . ". " . $area . "\n";
                }
                return response(rtrim($menu))
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 6) {
                return response("CON Select payment method:\n1. M-Pesa\n2. Tigo Pesa\n3. Airtel Money")
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) >= 7) {
                $serviceIndex = (int) $segments[1] - 1;
                $date = $segments[2];
                $time = $segments[3];
                $cityChoice = $segments[4];
                $areaChoice = isset($segments[5]) ? $segments[5] : null;
                $methodChoice = $segments[6];

                $cityMap = [
                    '1' => ['name' => 'Dar es Salaam', 'areas' => ['Bungé', 'Kinondoni', 'Temeke', 'Ilala', 'Tazara', 'Mwenge', 'Ubungo', 'Upanga']],
                    '2' => ['name' => 'Mbeya', 'areas' => ['Mbeya City', 'Rungwe', 'Chunya', 'Kyela', 'Tukuyu']],
                    '3' => ['name' => 'Kilimanjaro', 'areas' => ['Moshi', 'Arusha Town', 'Hai', 'Rombo', 'Siha']],
                    '4' => ['name' => 'Dodoma', 'areas' => ['Dodoma City', 'Chamwino', 'Kondoa', 'Mpwapwa']],
                    '5' => ['name' => 'Arusha', 'areas' => ['Arusha City', 'Karatu', 'Monduli', 'Ngorongoro']],
                    '6' => ['name' => 'Other', 'areas' => []],
                ];

                $city = $cityMap[$cityChoice] ?? null;
                if (!$city) {
                    return response("END Invalid city selection.")
                        ->header('Content-Type', 'text/plain');
                }

                $locationAddress = $city['name'];
                if ($cityChoice !== '6' && $areaChoice && isset($city['areas'][(int)$areaChoice - 1])) {
                    $area = $city['areas'][(int)$areaChoice - 1];
                    $locationAddress = "{$area}, {$city['name']}";
                }

                if (!isset($services[$serviceIndex])) {
                    return response("END Invalid service selection.")
                        ->header('Content-Type', 'text/plain');
                }
                if (!$this->isValidDate($date) || !$this->isValidTime($time)) {
                    return response("END Invalid date/time.")
                        ->header('Content-Type', 'text/plain');
                }

                $paymentMethod = match ($methodChoice) {
                    '1' => 'mpesa',
                    '2' => 'tigopesa',
                    '3' => 'airtelmoney',
                    default => null,
                };

                if (!$paymentMethod) {
                    return response("END Invalid payment method.")
                        ->header('Content-Type', 'text/plain');
                }

                $service = $services[$serviceIndex];

                $booking = Booking::create([
                    'client_id' => $client->id,
                    'service_id' => $service->id,
                    'booking_date' => $date,
                    'booking_time' => $time,
                    'status' => 'confirmed',
                    'payment_type' => 'cash',
                    'location_address' => $locationAddress,
                    'special_instructions' => null,
                ]);

                // Generate control number
                $controlNumber = $this->generateControlNumber($booking->id, $paymentMethod);

                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'client_id' => $client->id,
                    'amount' => $service->price,
                    'payment_method' => $paymentMethod,
                    'status' => 'completed',
                    'transaction_reference' => $controlNumber,
                    'paid_at' => now(),
                ]);

                $sms = new SmsService();
                $sms->sendBookingConfirmation($booking);
                $sms->sendPaymentConfirmation($payment);

                // Send airtime reward
                $airtimeService = new AirtimeService();
                $phone = $user->phone ?? config('services.airtime.default_phone');
                $airtimeService->sendAirtime($phone);

                $methodName = match ($paymentMethod) {
                    'mpesa' => 'M-Pesa',
                    'tigopesa' => 'Tigo Pesa',
                    'airtelmoney' => 'Airtel Money',
                    default => 'Mobile Money',
                };

                return response("END Booking Confirmed!\nRef: #{$booking->id}\nAmount: TZS " . number_format($service->price) . "\n{$methodName} Control Number: {$controlNumber}\nValid for 24 hours.\n\nBonus: TZS 500 airtime sent!")
                    ->header('Content-Type', 'text/plain');
            }
        }

        // Payment flow
        if ($segments[0] === '2') {
            $payments = Payment::where('client_id', $client->id)
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            if ($payments->isEmpty()) {
                return response("END No pending payments found.")
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 1) {
                $menu = "CON Select a payment:\n";
                foreach ($payments as $index => $payment) {
                    $menu .= ($index + 1) . ". Ref #{$payment->booking_id} - TZS " . number_format($payment->amount) . "\n";
                }
                return response(rtrim($menu))
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) === 2) {
                return response("CON Select payment method:\n1. M-Pesa\n2. Tigo Pesa\n3. Airtel Money")
                    ->header('Content-Type', 'text/plain');
            }

            if (count($segments) >= 3) {
                $paymentIndex = (int) $segments[1] - 1;
                $methodChoice = $segments[2];

                if (!isset($payments[$paymentIndex])) {
                    return response("END Invalid payment selection.")
                        ->header('Content-Type', 'text/plain');
                }

                $paymentMethod = match ($methodChoice) {
                    '1' => 'mpesa',
                    '2' => 'tigopesa',
                    '3' => 'airtelmoney',
                    default => null,
                };

                if (!$paymentMethod) {
                    return response("END Invalid payment method.")
                        ->header('Content-Type', 'text/plain');
                }

                $payment = $payments[$paymentIndex];
                
                // Generate control number
                $controlNumber = $this->generateControlNumber($payment->booking_id, $paymentMethod);
                
                $payment->update([
                    'payment_method' => $paymentMethod,
                    'status' => 'completed',
                    'transaction_reference' => $controlNumber,
                    'paid_at' => now(),
                ]);

                $sms = new SmsService();
                $sms->sendPaymentConfirmation($payment);

                $methodName = match ($paymentMethod) {
                    'mpesa' => 'M-Pesa',
                    'tigopesa' => 'Tigo Pesa',
                    'airtelmoney' => 'Airtel Money',
                    default => 'Mobile Money',
                };

                return response("END Payment Confirmed!\nRef: #{$payment->booking_id}\nAmount: TZS " . number_format($payment->amount) . "\n{$methodName} Control Number: {$controlNumber}\nValid for 24 hours.")
                    ->header('Content-Type', 'text/plain');
            }
        }

        return response("END Invalid option.")
            ->header('Content-Type', 'text/plain');
    }

    private function findUserByPhone(string $phoneNumber): ?User
    {
        $normalized = $this->normalizePhone($phoneNumber);
        $variants = array_filter(array_unique([
            $phoneNumber,
            $normalized,
            ltrim($normalized, '+'),
            $this->toLocalPhone($normalized),
        ]));

        return User::whereIn('phone', $variants)->first();
    }

    private function normalizePhone(string $phone): string
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

    private function toLocalPhone(string $phone): string
    {
        if (str_starts_with($phone, '+255')) {
            return '0' . substr($phone, 4);
        }
        return $phone;
    }

    private function isValidDate(string $date): bool
    {
        try {
            $parsed = Carbon::createFromFormat('Y-m-d', $date);
            return $parsed && $parsed->format('Y-m-d') === $date;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function isValidTime(string $time): bool
    {
        return preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $time) === 1;
    }

    /**
     * Generate a unique control number for payment
     */
    private function generateControlNumber(int $bookingId, string $paymentMethod): string
    {
        $prefix = match ($paymentMethod) {
            'mpesa' => 'MP',
            'tigopesa' => 'TP',
            'airtelmoney' => 'AM',
            default => 'MN',
        };

        // Format: PREFIX + YYYYMMDD + BookingID + Random4digits
        $date = now()->format('Ymd');
        $random = str_pad((string)rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        
        return $prefix . $date . str_pad((string)$bookingId, 4, '0', STR_PAD_LEFT) . $random;
    }
}
