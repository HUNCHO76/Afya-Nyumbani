<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\VoiceService;
use Illuminate\Http\JsonResponse;

class VoiceController extends Controller
{
    public function handle(Request $request)
    {
        $sessionId = $request->input('sessionId');
        $isActive = $request->input('isActive');
        $callerNumber = $request->input('callerNumber');

        // Africa's Talking voice XML response
        if ($isActive == 1) {
            $response = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
            $response .= "<Response>";
            $response .= "<Say>Welcome to Afya Nyumbani Care.</Say>";
            $response .= "<Say>Your booking and payment assistance is available via SMS and USSD.</Say>";
            $response .= "<Say>Thank you for calling.</Say>";
            $response .= "</Response>";

            return response($response)->header('Content-Type', 'application/xml');
        }

        return response('')->header('Content-Type', 'application/xml');
    }

    public function call(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'required|string',
            'to' => 'required|string',
        ]);

        $toNumbers = array_map('trim', explode(',', $validated['to']));

        $voice = new VoiceService();
        $success = true;

        foreach ($toNumbers as $to) {
            if ($to === '') {
                continue;
            }
            $sent = $voice->makeCall($to, $validated['from']);
            $success = $success && $sent;
        }

        return response()->json([
            'success' => $success,
            'from' => $validated['from'],
            'to' => $toNumbers,
        ]);
    }
}
