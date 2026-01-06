# Admin Account Management 🔐

## Current Admin Accounts

Your application now has **3 user accounts** in MongoDB Atlas:

| Username   | Password   | Role  | Email                      | Purpose           |
|------------|------------|-------|----------------------------|-------------------|
| admin      | admin123   | admin | admin@emergency.com        | Default admin     |
| testadmin  | Admin123!  | admin | testadmin@emergency.com    | Testing admin     |
| testuser   | test123    | user  | user@test.com              | Regular user      |

## How to Create More Admin Accounts

### Method 1: Using the Custom Script (Recommended)

```bash
cd /app/backend
python create_custom_admin.py <username> <password> <email>
```

**Example:**
```bash
python create_custom_admin.py johndoe SecurePass123 john@example.com
```

### Method 2: List All Users

```bash
cd /app/backend
python create_custom_admin.py --list
```

This will show all current users with their roles and emails.

### Method 3: Using the API (For Creating Users with Custom Roles)

You can use the registration API endpoint to create users programmatically:

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "SecurePassword123",
    "email": "newadmin@emergency.com",
    "role": "admin"
  }'
```

**Note:** The role field accepts: `"admin"`, `"user"`, or `"responder"`

## Testing Your New Admin Account

### 1. Test via API (Backend)
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testadmin", "password": "Admin123!"}'
```

### 2. Test via Frontend (Browser)
1. Navigate to `/login` page
2. Enter credentials:
   - Username: `testadmin`
   - Password: `Admin123!`
3. Should redirect to `/admin` dashboard

## Admin Privileges

Admin accounts have access to:
- ✅ Admin Dashboard (`/admin`)
- ✅ View all incident reports
- ✅ Manage user accounts
- ✅ Create and manage typhoon alerts
- ✅ Update incident statuses
- ✅ Assign incidents to responders
- ✅ Access system metrics and logs

## Security Best Practices

🔒 **Password Requirements:**
- Minimum 8 characters
- Mix of letters, numbers, and special characters
- Avoid common passwords

🔒 **Production Recommendations:**
- Change default admin credentials immediately
- Use strong, unique passwords
- Enable 2FA (if implemented)
- Regularly rotate credentials
- Monitor admin account activity

## Database Location

All user accounts are stored in:
- **Database:** MongoDB Atlas
- **Cluster:** mdrrmo-pioduran.4dvxkhg.mongodb.net
- **Database Name:** test_database
- **Collection:** users

## Troubleshooting

### Username Already Exists
If you get "Username already exists" error, try a different username or use `--list` to see all existing users.

### Cannot Connect to Database
Ensure:
1. MongoDB Atlas credentials are correct in `/app/backend/.env`
2. IP address is whitelisted in Atlas (or use 0.0.0.0/0 for all IPs)
3. Backend service is running: `sudo supervisorctl status backend`

### Test Login Fails
1. Verify user exists: `python create_custom_admin.py --list`
2. Check backend logs: `tail -50 /var/log/supervisor/backend.err.log`
3. Test API directly with curl (see examples above)

## Files Reference

- **Custom Admin Script:** `/app/backend/create_custom_admin.py`
- **Original Admin Script:** `/app/backend/create_admin.py`
- **Auth Module:** `/app/backend/auth.py`
- **Environment Config:** `/app/backend/.env`
