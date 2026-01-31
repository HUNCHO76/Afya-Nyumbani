# SMS Configuration Setup

## Overview
The system now sends SMS notifications to users for booking confirmations and payment reminders.

## SMS Provider
Using Africa's Talking API (popular in Tanzania). You can also configure other SMS providers.

## Configuration Steps

### 1. Get API Credentials
1. Sign up at [Africa's Talking](https://account.africastalking.com/auth/register)
2. Get your API Key from the dashboard
3. Note your username (use 'sandbox' for testing)

### 2. Update .env file
Add these variables to your `.env` file:

```env
SMS_API_KEY=your_api_key_here
SMS_API_SECRET=your_api_secret_here
SMS_USERNAME=sandbox
SMS_SENDER_ID=AFYA
SMS_API_URL=https://api.africastalking.com/version1/messaging
```

### 3. Testing
For development/testing without actual SMS:
- Leave `SMS_API_KEY` empty
- SMS messages will be logged to `storage/logs/laravel.log`
- Check the log to see what would have been sent

### 4. Production
- Add your live API credentials
- Change `SMS_USERNAME` from 'sandbox' to your actual username
- SMS will be sent to users automatically when they book

## SMS Features

### Booking Confirmation
Sent when a booking is created with:
- Service name
- Date and time
- Booking reference number

### Payment Reminder
Sent for mobile money payments with:
- Booking reference
- Amount to pay
- Payment method

## Phone Number Format
- System automatically formats Tanzanian numbers (+255)
- Accepts: 0712345678, 712345678, +255712345678
- All converted to international format

## Cost
- Check Africa's Talking pricing for SMS rates in Tanzania
- Typically very affordable for transactional SMS

## Alternative Providers
To use a different SMS provider:
1. Modify `app/Services/SmsService.php`
2. Update the API URL and request format
3. Common alternatives: Twilio, Nexmo, local Tanzanian providers
