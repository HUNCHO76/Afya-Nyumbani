# Login Credentials Reference

## How Role-Based Login Works

The login system now validates both **credentials** and **selected role**:

1. User selects their role from the dropdown
2. Enters email and password
3. System validates:
   - Email and password are correct
   - User's actual role matches the selected role
4. If valid, redirects to role-specific dashboard

## Test Credentials

All passwords are: `password`

### Super Admin
- **Role**: Super Admin
- **Email**: superadmin@afya.com
- **Redirects to**: `/dashboard/admin`

### Admin
- **Role**: Administrator
- **Email**: admin@afya.com
- **Redirects to**: `/dashboard/admin`

### Practitioner (Nurse - Sarah Johnson)
- **Role**: Healthcare Practitioner
- **Email**: sarah@afya.com
- **Redirects to**: `/dashboard/practitioner`

### Practitioner (Physiotherapist - Michael Ochieng)
- **Role**: Healthcare Practitioner
- **Email**: michael@afya.com
- **Redirects to**: `/dashboard/practitioner`

### Client (Mary Wanjiku)
- **Role**: Client/Patient
- **Email**: mary@client.com
- **Redirects to**: `/dashboard/client`

### Client (James Mwangi)
- **Role**: Client/Patient
- **Email**: james@client.com
- **Redirects to**: `/dashboard/client`

### Inventory Officer
- **Role**: Inventory Officer
- **Email**: inventory@afya.com
- **Redirects to**: `/dashboard/inventory`

### Finance Officer
- **Role**: Finance Officer
- **Email**: finance@afya.com
- **Redirects to**: `/dashboard/finance`

## Security Features

✅ **Role Validation**: System verifies the user's role matches the selected role during login
✅ **Rate Limiting**: Maximum 5 login attempts per email address
✅ **Session Management**: Secure session regeneration on successful login
✅ **Role-Based Redirects**: Automatic redirect to appropriate dashboard
✅ **Middleware Protection**: All dashboard routes protected by role middleware

## Testing Login Flow

1. Open: `http://localhost/afya-nyumbani`
2. Select role from "Login As" dropdown
3. Enter email and password
4. Click "Sign In"
5. System validates and redirects to role-specific dashboard

## Error Scenarios

❌ **Wrong credentials**: "These credentials do not match our records"
❌ **Role mismatch**: "These credentials do not match our records for the selected role"
❌ **Too many attempts**: Rate limited for 60 seconds
