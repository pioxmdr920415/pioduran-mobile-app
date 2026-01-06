# 🔓 Temporary Authentication Bypass

## Status: ACTIVE ⚠️

Authentication has been **temporarily disabled** for development/testing purposes.

## What Changed

### 1. AuthContext.jsx (`/app/frontend/src/contexts/AuthContext.jsx`)
- The `login()` function now bypasses the backend API call
- Automatically logs in as **admin** user when the login button is clicked
- Mock admin user data is set in localStorage
- Original authentication code is preserved in comments

### 2. Login.jsx (`/app/frontend/src/pages/Login.jsx`)
- Username and password fields are now **optional** (not required)
- Visual amber warning banner indicates auth is bypassed
- Users can click "Sign In" with any credentials or empty fields

## Current Behavior

When a user clicks the "Sign In" button on the login page:

1. ✅ **No backend validation** - API call is skipped
2. ✅ **Auto-login as Admin** - User is automatically logged in with admin role
3. ✅ **Navigate to Admin Dashboard** - Redirects directly to `/admin`
4. ✅ **Mock data stored** - Fake token and user data saved in localStorage

### Mock Admin User Data:
```javascript
{
  id: 'admin-mock-id',
  username: 'admin',
  email: 'admin@emergency.com',
  role: 'admin',
  created_at: new Date().toISOString()
}
```

## How to Test

1. Navigate to the login page: `/login`
2. Click "Sign In" button (with or without entering credentials)
3. You will be automatically redirected to Admin Dashboard: `/admin`

## How to Re-enable Authentication

To restore normal authentication:

### In `/app/frontend/src/contexts/AuthContext.jsx`:

**Replace the `login()` function with:**

```javascript
const login = async (credentials) => {
  try {
    setLoading(true);
    setError(null);
    const response = await authAPI.login(credentials);
    
    // Store token and user data from response
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    setUser(response.user);
    
    return { success: true, user: response.user };
  } catch (err) {
    const errorMessage = err.response?.data?.detail || 'Login failed';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};
```

### In `/app/frontend/src/pages/Login.jsx`:

1. Add `required` attribute back to username and password inputs
2. Change the amber warning banner back to blue demo credentials info
3. Update placeholder text back to original

## ⚠️ Security Warning

**DO NOT deploy this to production!**

This bypass completely disables authentication and should ONLY be used for:
- Local development
- Testing UI flows
- Demo purposes

## Files Modified

1. `/app/frontend/src/contexts/AuthContext.jsx` - Login function bypassed
2. `/app/frontend/src/pages/Login.jsx` - UI updated with bypass notice

---

**Last Updated:** January 4, 2026  
**Modified By:** Development Team  
**Purpose:** Temporary development bypass for testing
