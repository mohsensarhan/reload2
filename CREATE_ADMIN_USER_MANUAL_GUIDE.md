# Manual Admin User Creation Guide

Since the API keys are not working for automated user creation, here's a step-by-step guide to create an admin user manually through the Supabase dashboard.

---

## 🎯 Quick Steps Overview

1. Go to Supabase Dashboard
2. Create a new user in Authentication
3. Add user record to the `users` table with admin role
4. Login to your application

---

## 📋 Detailed Step-by-Step Instructions

### Step 1: Access Your Supabase Project

1. Go to: https://supabase.com/dashboard
2. Login to your Supabase account
3. Select your project: **oktiojqphavkqeirbbul**

---

### Step 2: Create Authentication User

1. In the left sidebar, click on **Authentication** (🔐 icon)
2. Click on **Users** tab
3. Click the **Add User** button (top right)
4. Fill in the form:
   - **Email:** `admin@reload2.com` (or any email you prefer)
   - **Password:** Create a strong password (at least 12 characters)
   - **Auto Confirm User:** ✅ Check this box (important!)
5. Click **Create User**
6. **IMPORTANT:** Copy the User ID that appears - you'll need it in the next step

---

### Step 3: Add User to the Users Table

Now you need to add this user to your `users` table with the admin role:

#### Option A: Using Table Editor (Easiest)

1. In the left sidebar, click on **Table Editor** (📊 icon)
2. Select the **users** table from the dropdown
3. Click **Insert** → **Insert row**
4. Fill in the fields:
   - **id:** Paste the User ID you copied from Step 2
   - **email:** Same email as Step 2 (e.g., `admin@reload2.com`)
   - **role:** Type `admin` (exactly, lowercase)
   - **created_at:** Leave as default (will auto-fill)
5. Click **Save**

#### Option B: Using SQL Editor (Alternative)

1. In the left sidebar, click on **SQL Editor** (⚡ icon)
2. Click **New Query**
3. Paste this SQL (replace `YOUR_USER_ID` with the actual User ID from Step 2):

```sql
INSERT INTO users (id, email, role, created_at)
VALUES (
  'YOUR_USER_ID',  -- Replace with actual User ID from Step 2
  'admin@reload2.com',  -- Replace with your email
  'admin',
  NOW()
);
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

---

### Step 4: Verify User Creation

Let's verify everything is set up correctly:

1. Go back to **Table Editor** → **users** table
2. You should see your user with:
   - ✅ Correct email
   - ✅ Role set to `admin`
   - ✅ Created timestamp

---

### Step 5: Login to Your Application

Now you can login to your application:

1. Go to: https://reload2.vercel.app/login
2. Enter your credentials:
   - **Email:** The email you created (e.g., `admin@reload2.com`)
   - **Password:** The password you set in Step 2
3. Click **Login**
4. After successful login, navigate to: https://reload2.vercel.app/admin

---

## 🎉 Success!

You should now have full access to the admin panel with all features:

- ✅ Metrics Management
- ✅ Scenario Modeling
- ✅ User Management
- ✅ Audit Logs
- ✅ Real-time Updates

---

## 🔒 Recommended Login Credentials

For security, I recommend:

- **Email:** `admin@reload2.com` (or use your actual email)
- **Password:** At least 12 characters with:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
  - Example: `Admin2025!Reload#`

---

## 🐛 Troubleshooting

### Issue: "User already exists" error in Step 2

**Solution:** 
1. Go to **Authentication** → **Users**
2. Find the existing user
3. Copy their User ID
4. Proceed to Step 3 to add them to the users table

### Issue: "Cannot insert duplicate key" in Step 3

**Solution:** The user already exists in the users table. Try updating instead:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@reload2.com';
```

### Issue: "Access Denied" when accessing /admin

**Solution:** 
1. Verify the user's role is exactly `admin` (lowercase) in the users table
2. Try logging out and logging back in
3. Clear browser cache and cookies

### Issue: Can't see the users table

**Solution:** 
1. Make sure you're in the correct project
2. Check if the table exists by going to **Table Editor**
3. If the table doesn't exist, you may need to run the database migrations

---

## 📊 Database Schema Reference

Your `users` table should have this structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Valid roles:
- `admin` - Full access to admin panel
- `user` - Regular user access (view-only dashboard)

---

## 🔐 Security Notes

1. **Never share your admin password**
2. **Use a strong, unique password**
3. **Enable 2FA if available** (in Supabase Auth settings)
4. **Regularly review audit logs** for suspicious activity
5. **Don't commit credentials to Git**

---

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console (F12) for error messages
2. Verify your Supabase project is active
3. Ensure RLS policies allow admin users to access data
4. Check that environment variables are set correctly in Vercel

---

## ✅ Checklist

Before you start, make sure you have:

- [ ] Access to Supabase dashboard
- [ ] Your project URL: https://oktiojqphavkqeirbbul.supabase.co
- [ ] A strong password ready
- [ ] Email address to use for admin account

After completion, verify:

- [ ] User created in Authentication
- [ ] User added to users table with admin role
- [ ] Can login at https://reload2.vercel.app/login
- [ ] Can access https://reload2.vercel.app/admin
- [ ] Admin panel loads with all features

---

## 🎯 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard
**Project ID:** oktiojqphavkqeirbbul
**Login URL:** https://reload2.vercel.app/login
**Admin Panel URL:** https://reload2.vercel.app/admin

**Default Admin Email:** admin@reload2.com
**Role Required:** admin (lowercase)

---

Good luck! Once you've created the admin user, you'll have full access to manage your reload2 dashboard. 🚀