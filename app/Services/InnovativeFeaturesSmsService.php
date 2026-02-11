<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InnovativeFeaturesSmsService
{
    /**
     * Send practitioner arrival confirmation request
     */
    public function sendArrivalConfirmationRequest($clientPhone, $practitionerName, $visitId): bool
    {
        $message = "Dr. {$practitionerName} has arrived for your visit. Reply YES/NO to confirm.";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send pre-visit symptom snapshot reminder
     */
    public function sendSymptomSnapshotReminder($clientPhone, $appointmentTime): bool
    {
        $message = "Your healthcare visit is in 2 hours. Quick symptom check: Rate pain (1-10), temperature, energy. Reply with numbers separated by commas.";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send emergency escalation alert
     */
    public function sendEmergencyEscalationAlert($recipientPhone, $clientName, $practitionerName, $visitId): bool
    {
        $message = "EMERGENCY: Client {$clientName} has escalated during visit with Dr. {$practitionerName} (Visit #{$visitId}). Immediate response required.";
        return $this->sendAlert($recipientPhone, $message);
    }

    /**
     * Send micro-feedback quality rating prompt
     */
    public function sendMicroFeedbackPrompt($clientPhone, $minutesElapsed): bool
    {
        $message = "How is your care quality? Reply: 1(Poor) 2(Fair) 3(Good) 4(Excellent)";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send health token access notification
     */
    public function sendHealthTokenNotification($clientPhone, $entityType, $entityName, $duration = 48): bool
    {
        $message = "You've granted {$entityType} {$entityName} access to your health records for {$duration} hours. They can view: lab results, prescriptions. Revoke anytime in app.";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send care code for visit completion
     */
    public function sendCareCode($clientPhone, $code, $validityMinutes = 120): bool
    {
        $message = "Your visit is complete! Confirm with code: {$code} (Valid for {$validityMinutes} minutes)";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send comfort/safety level prompt
     */
    public function sendComfortPrompt($clientPhone): bool
    {
        $message = "Comfort level (1-5)? Also note safety (1-5). Reply: C:X S:Y (e.g., C:4 S:5)";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send appointment swap notification
     */
    public function sendSwapRequest($practitionerPhone, $initiatorName, $appointmentDate): bool
    {
        $message = "Dr. {$initiatorName} requests to swap appointment on {$appointmentDate}. Check app to accept/decline.";
        return $this->send($practitionerPhone, $message);
    }

    /**
     * Send swap acceptance notification
     */
    public function sendSwapAcceptanceNotification($practitionerPhone, $responderName): bool
    {
        $message = "Dr. {$responderName} accepted your appointment swap request. Details updated.";
        return $this->send($practitionerPhone, $message);
    }

    /**
     * Send visit start confirmation request to client
     */
    public function sendVisitStartConfirmation($clientPhone, $practitionerName): bool
    {
        $message = "Dr. {$practitionerName} is starting your visit. Reply YES to confirm.";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send visit end confirmation request
     */
    public function sendVisitEndConfirmation($clientPhone, $practitionerName): bool
    {
        $message = "Visit with Dr. {$practitionerName} is complete. Reply OK to confirm end of service.";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send post-visit report notification
     */
    public function sendPostVisitReportNotification($clientPhone, $practitionerName, $hasFollowUp = false): bool
    {
        $message = "Dr. {$practitionerName} submitted visit report. ";
        if ($hasFollowUp) {
            $message .= "Follow-up appointment scheduled. Check app for details.";
        } else {
            $message .= "View report in app.";
        }
        return $this->send($clientPhone, $message);
    }

    /**
     * Send follow-up appointment offer
     */
    public function sendFollowUpOffer($clientPhone, $practitionerName, $suggestedDate): bool
    {
        $message = "Dr. {$practitionerName} recommends follow-up on {$suggestedDate}. Reply YES to book or NO to decline.";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send token access audit notification to client
     */
    public function sendTokenAccessNotification($clientPhone, $entityName, $accessedRecords, $accessedAt): bool
    {
        $message = "{$entityName} accessed your health records ({$accessedRecords}) at {$accessedAt}. View full audit in app.";
        return $this->send($clientPhone, $message);
    }

    /**
     * Send base SMS message
     */
    public function send($phoneNumber, $message): bool
    {
        try {
            if (!config('services.africas_talking.username') || !config('services.africas_talking.api_key')) {
                Log::warning('Africa\'s Talking credentials not configured');
                return false;
            }

            $response = Http::asForm()
                ->withBasicAuth(config('services.africas_talking.username'), config('services.africas_talking.api_key'))
                ->post('https://api.sandbox.africastalking.com/version1/messaging', [
                    'username' => config('services.africas_talking.username'),
                    'recipients' => $this->formatPhoneNumber($phoneNumber),
                    'message' => $message,
                ])
                ->json();

            Log::info('SMS sent', ['phone' => $phoneNumber, 'response' => $response]);
            return true;
        } catch (\Exception $e) {
            Log::error('SMS send failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Send alert SMS (high priority)
     */
    public function sendAlert($phoneNumber, $message): bool
    {
        // Could implement priority queuing here
        return $this->send($phoneNumber, "🚨 ALERT: " . $message);
    }

    /**
     * Format phone number for Africa's Talking
     */
    private function formatPhoneNumber($phone): string
    {
        // Remove any non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Add country code if not present (assuming Tanzania +255)
        if (strlen($phone) === 10 && substr($phone, 0, 1) === '7') {
            $phone = '255' . substr($phone, 1);
        } elseif (!str_starts_with($phone, '255')) {
            $phone = '255' . $phone;
        }

        return '+' . $phone;
    }
}
