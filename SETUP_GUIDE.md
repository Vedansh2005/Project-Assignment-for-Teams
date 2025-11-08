# TeamFlow - Setup and Run Guide

## Quick Start Guide for XAMPP

### Prerequisites
- ✅ XAMPP installed and running
- ✅ Apache and MySQL services started in XAMPP Control Panel

---

## Step-by-Step Setup

### Step 1: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Start **Apache** (click "Start" button)
3. Start **MySQL** (click "Start" button)
4. Both should show green "Running" status

### Step 2: Setup Database

You have **3 options** to set up the database:

#### **Option A: Automated Setup (Easiest - Recommended)**

1. Open your browser
2. Go to: `http://localhost/wtpro/database_setup.php`
3. Check the box "Insert sample data (5 users and 5 projects)" (already checked)
4. Click **"Setup Database"** button
5. Wait for success messages
6. ✅ Database is ready!

#### **Option B: phpMyAdmin Import (Recommended for seeing data)**

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on **"Import"** tab (top menu)
3. Click **"Choose File"** button
4. Select `database_manual.sql` from your project folder
5. Click **"Go"** button at the bottom
6. ✅ Database `teamflow` will be created with sample data

#### **Option C: Command Line**

1. Open Command Prompt or PowerShell
2. Navigate to project folder:
   ```bash
   cd c:\xampp\htdocs\wtpro
   ```
3. Run MySQL import:
   ```bash
   mysql -u root -p < database_manual.sql
   ```
   (Press Enter when asked for password, or enter your MySQL password if set)

---

### Step 3: Verify Database Configuration

Check `config.php` - it should have these settings (default XAMPP settings):

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'teamflow');
define('DB_USER', 'root');
define('DB_PASS', '');  // Empty for default XAMPP
```

**Note:** If you changed your MySQL root password, update `DB_PASS` in `config.php`

---

### Step 4: Access the Application

1. Open your web browser
2. Go to: **`http://localhost/wtpro/`**
3. You should see the TeamFlow home page! 🎉

---

## Testing the Application

### Test Admin Login
1. Click **"Login"** button
2. Use admin credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. You'll be redirected to the Admin Dashboard

### Test User Signup
1. Click **"Sign Up"** button
2. Fill in the registration form
3. Create your account
4. You'll be redirected to User Dashboard

### Test with Sample Data
If you imported sample data, you can login as:
- **John Doe:** `john.doe@example.com` / `password123`
- **Jane Smith:** `jane.smith@example.com` / `password123`
- **Mike Johnson:** `mike.johnson@example.com` / `password123`
- **Sarah Williams:** `sarah.williams@example.com` / `password123`
- **David Brown:** `david.brown@example.com` / `password123`

---

## Troubleshooting

### Problem: "404 Not Found" or "Page not found"
**Solution:**
- Make sure Apache is running in XAMPP
- Check the URL: `http://localhost/wtpro/` (not `http://localhost/wtpro/index.html`)
- Verify files are in `c:\xampp\htdocs\wtpro\`

### Problem: "405 Method Not Allowed" error
**Solution:**
- Clear browser cache (Ctrl+F5)
- Check that all PHP files are saved correctly
- Restart Apache in XAMPP Control Panel

### Problem: "Database connection failed"
**Solution:**
- Make sure MySQL is running in XAMPP
- Check `config.php` database credentials
- Run database setup again: `http://localhost/wtpro/database_setup.php`

### Problem: "Access denied for user 'root'@'localhost'"
**Solution:**
- If you set a MySQL password, update `DB_PASS` in `config.php`
- Or reset MySQL password in XAMPP

### Problem: Database doesn't exist
**Solution:**
- Run database setup: `http://localhost/wtpro/database_setup.php`
- Or import via phpMyAdmin

---

## Project Structure

```
wtpro/
├── index.html          # Home page
├── login.html          # Login page
├── signup.html         # Registration page
├── dashboard.html      # User dashboard
├── admin.html          # Admin panel
├── messages.html       # Messages page
├── config.php          # Database configuration
├── auth.php            # Authentication API
├── users.php           # User management API
├── projects.php        # Project management API
├── database_setup.php  # Database setup script
├── database_manual.sql # SQL file for manual import
└── js/                 # JavaScript files
```

---

## Default Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`

### Sample Users (if database imported)
- All sample users have password: `password123`
- Check `database_manual.sql` for full list

---

## Features Available

✅ User Registration & Login  
✅ Admin Dashboard (manage users & projects)  
✅ User Dashboard (view assigned projects)  
✅ Project Creation & Assignment  
✅ Profile Management (skills, experience, qualifications)  
✅ Messages/Chat Interface  

---

## Next Steps

1. ✅ Database is set up
2. ✅ Application is running
3. 🎯 Start using the application!

**Happy Coding! 🚀**

