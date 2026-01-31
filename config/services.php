<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'sms' => [
        'api_key' => env('SMS_API_KEY'),
        'api_secret' => env('SMS_API_SECRET'),
        'username' => env('SMS_USERNAME', 'sandbox'),
        'sender_id' => env('SMS_SENDER_ID', 'AFYA'),
        'api_url' => env('SMS_API_URL', 'https://api.africastalking.com/version1/messaging'),
    ],

    'airtime' => [
        'api_key' => env('AIRTIME_API_KEY'),
        'username' => env('AIRTIME_USERNAME', 'sandbox'),
        'currency' => env('AIRTIME_CURRENCY', 'TZS'),
        'reward_amount' => env('AIRTIME_REWARD_AMOUNT', 500),
        'default_phone' => env('AIRTIME_DEFAULT_PHONE', '+255686081750'),
    ],

    'voice' => [
        'api_key' => env('VOICE_API_KEY'),
        'username' => env('VOICE_USERNAME', 'sandbox'),
        'call_from' => env('VOICE_CALL_FROM'),
        'default_phone' => env('VOICE_DEFAULT_PHONE', '+255686081750'),
    ],

];
