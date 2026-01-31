# Afya Nyumbani - Home Healthcare System

A comprehensive home healthcare management system built with Laravel 12, Inertia.js, React, and TypeScript. Enables seamless booking of healthcare services with integrated mobile money payments, SMS notifications, and voice communications.

## Features

### Core Functionality
- **Service Booking**: Clients can book healthcare services with date, time, and location selection
- **Role-Based Access**: Support for Admin, Practitioner, Client, Inventory Officer, and Finance Officer roles
- **Client Profile Management**: Auto-creation of client profiles and patient records during registration
- **Appointment Management**: View, reschedule, and cancel appointments with full audit trail

### Payment Integration
- **Mobile Money Payments**: M-Pesa, Tigo Pesa, and Airtel Money support
- **Payment Control Numbers**: Auto-generated control numbers for each transaction
- **Automatic Payment Confirmation**: Immediate payment confirmation for mobile money transactions
- **Payment Tracking**: Real-time payment status and history

### Communication Features (Africa's Talking Integration)
- **SMS Notifications**: 
  - Booking confirmations with service details
  - Payment confirmations with control numbers
  - Payment reminders for pending payments
  - Airtime rewards notifications
  
- **USSD Booking Flow**: 
  - Service selection via USSD menu
  - Booking creation and payment in one flow
  - Control number generation for reference
  
- **Voice API**: 
  - Outbound call capabilities
  - IVR callback handling
  - Voice notifications for important updates
  
- **Airtime Rewards**:
  - Automatic 500 TZS airtime reward after booking
  - Airtime validation and status callbacks
  - Transaction tracking and logging

### Dashboard & Analytics
- **Client Dashboard**: 
  - Total appointments display from database
  - Upcoming appointments with status filters
  - Recent activities and payment history
  - Quick statistics (total, completed, pending)
  
- **Paginated Appointments**: 
  - Table view with sorting and filtering
  - Responsive pagination with page indicators
  - Status-based filtering (pending, confirmed, completed, cancelled)
  - Search functionality for services and practitioners

## Technology Stack

### Backend
- **Laravel 12.0** with PHP 8.2
- **MySQL** Database
- **Eloquent ORM** for data management
- **Inertia.js 2.0** for server-side rendering
- **Africa's Talking SDK** for SMS, USSD, Voice, and Airtime

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **date-fns** for date formatting
- **Vite** for build tooling

### Third-Party Services
- **Africa's Talking**: SMS, USSD, Voice, and Airtime API
- **ngrok**: Webhook tunneling for development

## Installation & Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- XAMPP (for development)

### Steps

1. **Clone & Setup**
```bash
cd /c/xampp/htdocs
git clone https://github.com/your-repo/afya-nyumbani.git
cd afya-nyumbani
```

2. **Install Dependencies**
```bash
composer install
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Database Setup**
```bash
php artisan migrate
php artisan db:seed
```

5. **Build Frontend**
```bash
npm run build  # Production
npm run dev    # Development
```

6. **Start Development Server**
```bash
php artisan serve
npm run dev    # In another terminal
```

## Configuration

### Africa's Talking API

Add to `.env`:
```env
# SMS Configuration
SMS_API_KEY=atsk_your_api_key_here
SMS_USERNAME=NyumbaniAfya  # Your Africa's Talking username
SMS_API_URL=https://api.africastalking.com/version1/messaging

# Airtime Configuration
AIRTIME_API_KEY=atsk_your_api_key_here
AIRTIME_USERNAME=NyumbaniAfya
AIRTIME_CURRENCY=TZS
AIRTIME_REWARD_AMOUNT=500
AIRTIME_DEFAULT_PHONE=+255686081750

# Voice Configuration
VOICE_API_KEY=atsk_your_api_key_here
VOICE_USERNAME=NyumbaniAfya
VOICE_CALL_FROM=+254711XXXYYY
VOICE_DEFAULT_PHONE=+255686081750
```

### Webhook Configuration (ngrok)

1. Start ngrok: `ngrok http 8000`
2. Update callbacks in Africa's Talking Dashboard:
   - SMS Callbacks: `https://your-ngrok-url/sms`
   - USSD Callbacks: `https://your-ngrok-url/Ussd` (capital U)
   - Airtime Validation: `https://your-ngrok-url/Airtime/validation`
   - Airtime Status: `https://your-ngrok-url/Airtime/status`
   - Voice Callbacks: `https://your-ngrok-url/voice`

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ussd` | USSD booking and payment flow |
| POST | `/Ussd` | USSD (capital U variant) |
| POST | `/voice` | Voice callback handler |
| POST | `/voice/call` | Initiate outbound voice call |
| POST | `/airtime/validation` | Airtime validation callback |
| POST | `/airtime/status` | Airtime status callback |

### Authenticated Client Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/client/bookings` | List all bookings (paginated) |
| GET | `/client/bookings/create` | Booking form |
| POST | `/client/bookings` | Create booking |
| GET | `/client/bookings/{id}` | View booking details |
| POST | `/client/bookings/{id}/cancel` | Cancel booking |
| GET | `/dashboard/client` | Client dashboard |

## Usage

### Creating a Booking

**Web Form:**
1. Login as client
2. Navigate to "New Booking"
3. Select service, date, time, and payment method
4. Choose between M-Pesa, Tigo Pesa, or Airtel Money
5. Submit booking - automatic payment confirmation with SMS + airtime reward

**USSD:**
```
Dial USSD code:
1. Select "Book a service"
2. Choose service number
3. Enter date (YYYY-MM-DD)
4. Enter time (HH:MM)
5. Select payment method
6. Receive confirmation SMS with control number
```

### Viewing Appointments

1. Go to "My Appointments"
2. View all bookings in table format with:
   - Service details
   - Date & Time
   - Practitioner info
   - Price and payment status
   - Action buttons (View, Pay, Cancel, Service Details)
3. Use filters for status, payment type, and search
4. Navigate through paginated results

## Payment Flow

### Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)

```
User Selects MNO → System generates Control Number → 
SMS sent with details → User pays via MNO USSD → 
System marks payment as completed → Confirmation SMS sent
```

**Control Number Format:**
- **M-Pesa**: MP20260131000123456789
- **Tigo Pesa**: TP20260131000123456789
- **Airtel Money**: AM20260131000123456789

### SMS Notifications Sent

1. **Booking Confirmation**: Service name, date/time, reference number
2. **Payment Confirmation**: Amount, method, control number (if MNO)
3. **Airtime Reward**: 500 TZS airtime notification

## Database Schema

### Key Models
- **User**: Authentication and role management
- **Client**: Customer profile and contact info
- **Booking**: Service appointments
- **Payment**: Payment records with transaction references
- **Service**: Available healthcare services
- **Practitioner**: Healthcare providers
- **Appointment**: Visit records

## Security

- **CSRF Protection**: All POST endpoints protected except webhooks
- **Role-Based Middleware**: Route protection by user role
- **Phone Validation**: International format enforcement (+255)
- **Payment Verification**: Transaction reference logging
- **Webhook Validation**: Africa's Talking callback verification

## Common Issues & Solutions

### SMS Not Sending
- **Issue**: 401 Unauthorized
- **Solution**: Verify SMS_USERNAME matches Africa's Talking account (sandbox vs production)

### USSD Not Working
- **Issue**: 405 Method Not Allowed
- **Solution**: Ensure both `/ussd` and `/Ussd` routes are registered (case-sensitive)

### Airtime Not Sending
- **Issue**: Invalid currency code
- **Solution**: Format must be "TZS 500.00" (currency space amount)

### Payment Confirmation Delay
- **Issue**: SMS arrives late
- **Solution**: Check phone number format starts with +255 or 0 (auto-converted)

## Development Notes

### Useful Commands
```bash
php artisan tinker                    # Interactive shell
php artisan cache:clear              # Clear application cache
php artisan route:clear              # Clear route cache
php artisan config:clear             # Clear config cache
php artisan migrate --fresh --seed   # Reset database
npm run dev                          # Development frontend
npm run build                        # Production build
```

### Key Files
- `app/Services/SmsService.php` - SMS sending logic
- `app/Services/AirtimeService.php` - Airtime reward logic
- `app/Services/VoiceService.php` - Voice calling logic
- `app/Http/Controllers/UssdController.php` - USSD flow logic
- `app/Http/Controllers/AirtimeCallbackController.php` - Webhook handlers
- `resources/js/Pages/Client/AllBookings.tsx` - Appointments table
- `resources/js/Pages/Dashboard/Client.tsx` - Client dashboard

### Testing Phone Numbers
For development (sandbox mode):
- Add test numbers in Africa's Talking Dashboard
- Use format: +254711XXXYYY (Kenya) or +255XXXXXXXXX (Tanzania)

## Support

For issues or questions:
1. Check logs: `storage/logs/laravel.log`
2. Verify Africa's Talking credentials in `.env`
3. Test USSD/Voice endpoints with Postman
4. Check SMS delivery reports in Africa's Talking Dashboard

## License

This project is licensed under the MIT License.

## Contributors

- Abdul Rahman Hussein - Initial implementation
- Development team - Continued enhancements

---

**Last Updated**: January 31, 2026  
**Version**: 1.0.0
