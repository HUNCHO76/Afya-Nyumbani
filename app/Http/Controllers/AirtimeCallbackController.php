<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AirtimeCallbackController extends Controller
{
    /**
     * Airtime validation callback.
     * Respond with {"status": "Validated"} or {"status": "Failed"}.
     */
    public function validateAirtime(Request $request)
    {
        $payload = $request->all();

        Log::info('Airtime validation callback received', [
            'transactionId' => $payload['transactionId'] ?? null,
            'phoneNumber' => $payload['phoneNumber'] ?? null,
            'sourceIpAddress' => $payload['sourceIpAddress'] ?? null,
            'currencyCode' => $payload['currencyCode'] ?? null,
            'amount' => $payload['amount'] ?? null,
            'raw' => $payload,
        ]);

        // TODO: Add business rules for validation if needed.
        return response()->json(['status' => 'Validated']);
    }

    /**
     * Airtime delivery status callback.
     */
    public function statusAirtime(Request $request)
    {
        $payload = $request->all();

        Log::info('Airtime status callback received', [
            'phoneNumber' => $payload['phoneNumber'] ?? null,
            'description' => $payload['description'] ?? null,
            'status' => $payload['status'] ?? null,
            'requestId' => $payload['requestId'] ?? null,
            'discount' => $payload['discount'] ?? null,
            'value' => $payload['value'] ?? null,
            'raw' => $payload,
        ]);

        return response()->json(['status' => 'OK']);
    }
}
