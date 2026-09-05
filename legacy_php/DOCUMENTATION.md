# TeamFlow - Complete Documentation

A simple team management system using only basic PHP, HTML, CSS, and JavaScript.

---//remove bind_params use mysqli_connect instead of mysqli
## 📋 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Project Structure](#project-structure)
3. [Essential Files](#essential-files)
4. [File Dependencies](#file-dependencies)
5. [Setup Instructions](#setup-instructions)
6. [Troubleshooting](#troubleshooting)
7. [Database Information](#database-information)
8. [Code Flow Examples](#code-flow-examples)
9. [URL Patterns](#url-patterns)
10. [Features](#features)

---

## 🚀 Quick Start Guide

### Prerequisites
- XAMPP installed and running
- Apache and MySQL services started

### Step 1: Start Services
1. Open **XAMPP Control Panel**
2. Start **Apache** (click "Start")
3. Start **MySQL** (click "Start")
4. Both should show green "Running" status

### Step 2: Access Application
**IMPORTANT:** Use `http://localhost/wtpro/` NOT `file:///`

✅ **DO THIS:**
- Open browser
- Type: `http://localhost/wtpro/`
- Press Enter

❌ **DON'T DO THIS:**
- Double-click index.html
- Use file:/// paths
- Open files directly from Windows Explorer

### Step 3: Test PHP
Visit: `http://localhost/wtpro/test.php`
- Should see: "PHP is working!"
- If it downloads or shows code → PHP not configured

### Step 4: Login
**Admin Credentials:**
- Username: `admin`
- Password: `admin123`

Or create a new user account via Sign Up.

---

## 📁 Project Structure

### Current Clean Structure (11 Essential Files)

```
wtpro/
├── config.php          ⭐ REQUIRED - Database & session management
├── index.html          ⭐ REQUIRED - Home page
├── login.php           ⭐ REQUIRED - Login page
├── signup.php          ⭐ REQUIRED - Signup page
├── logout.php          ⭐ REQUIRED - Logout handler
├── dashboard.php       ⭐ REQUIRED - User dashboard
├── admin.php           ⭐ REQUIRED - Admin dashboard
├── styles.css          ⭐ REQUIRED - Stylesheet
├── index.php           (redirect helper)
├── test.php            (PHP test file)
├── fix_collation.php   (one-time fix script)
└── js/
    └── app.js          (basic utilities)
```

**Total: 11 application files + 1 JavaScript file**

---

## ⚠️ Essential Files (Project Won't Work Without These)

### 1. **config.php** ⭐ MOST IMPORTANT

**Status:** ABSOLUTELY REQUIRED  
**What happens if missing:** All pages crash with "require_once 'config.php' failed"

**Purpose:**
- Database connection and configuration
- Session management
- Auto-creates database and tables
- Provides helper functions for authentication

**Key Functions:**
```php
getDBConnection()      // Connects to MySQL, creates DB if needed
createTables()         // Creates users, projects, tasks tables
isLoggedIn()           // Checks if user is logged in
isAdmin()              // Checks if user is admin
requireLogin()         // Redirects to login if not logged in
requireAdmin()         // Redirects if not admin
getCurrentUserId()     // Gets logged-in user's ID
getCurrentUsername()   // Gets logged-in user's username
```

**Configuration Constants:**
- `DB_HOST` - Database server (localhost)
- `DB_NAME` - Database name (teamflow)
- `DB_USER` - Database username (root)
- `DB_PASS` - Database password (empty for XAMPP)
- `ADMIN_USERNAME` - Admin login username (admin)
- `ADMIN_PASSWORD` - Admin login password (admin123)

---

### 2. **login.php** ⭐ REQUIRED

**Status:** REQUIRED for authentication  
**What happens if missing:** Users cannot log in

**Purpose:**
- Displays login form
- Handles login authentication
- Sets session variables
- Redirects to dashboard or admin panel

**Flow:**
1. User submits form → POST request
2. Checks admin credentials first
3. Then checks user credentials in database
4. Sets session variables
5. Redirects to appropriate dashboard

---

### 3. **signup.php** ⭐ REQUIRED

**Status:** REQUIRED for user registration  
**What happens if missing:** New users cannot register

**Purpose:**
- Displays registration form
- Validates user input
- Creates new user account in database
- Redirects to login after success

**Key Features:**
- Email uniqueness check
- Password validation (min 6 characters)
- Password confirmation check
- Auto-generates username from email
- Stores skills and qualifications as JSON

---

### 4. **logout.php** ⭐ REQUIRED

**Status:** REQUIRED for logout functionality  
**What happens if missing:** Users cannot log out

**Purpose:**
- Destroys PHP session
- Redirects to home page

**Code:**
```php
session_destroy();
header('Location: index.html');
exit;
```

---

### 5. **dashboard.php** ⭐ REQUIRED

**Status:** REQUIRED for user interface  
**What happens if missing:** Logged-in users have no interface

**Purpose:**
- Main user dashboard
- Displays user profile
- Shows assigned projects
- Lists user's tasks
- Allows task progress updates
- Allows profile editing

**Key Features:**
- View profile (name, email, skills, qualifications)
- Edit profile (experience, skills, qualifications) - `?edit=profile`
- View progress statistics (completed, in progress, pending)
- View assigned projects
- View and update task progress
- View all tasks in assigned projects

**Form Handlers:**
- `updateTask` - Updates task progress
- `updateProfile` - Updates user profile

---

### 6. **admin.php** ⭐ REQUIRED

**Status:** REQUIRED for admin interface  
**What happens if missing:** Admin cannot manage system

**Purpose:**
- Complete admin dashboard
- User management
- Project management
- Task management
- Assignment management

**Key Features:**
- View all users
- Create projects
- Assign projects to users
- Create tasks
- Edit tasks
- Delete tasks

**Tabs:**
- `?tab=users` - View all users
- `?tab=projects` - Manage projects
- `?tab=assign` - Assign projects to users
- `?tab=tasks` - Manage tasks

**Actions:**
- `?action=create` - Show create form
- `?action=edit&taskId=xxx` - Show edit form
- `?action=delete&taskId=xxx` - Delete task

---

### 7. **index.html** ⭐ REQUIRED

**Status:** REQUIRED for landing page  
**What happens if missing:** No entry point to application

**Purpose:**
- Home/landing page
- Links to login and signup
- Displays features

**Key Features:**
- Navigation to login/signup
- Feature showcase
- Simple static page

---

### 8. **styles.css** ⭐ REQUIRED

**Status:** REQUIRED for styling  
**What happens if missing:** Pages will work but look unstyled

**Purpose:**
- Global stylesheet
- Consistent design across all pages
- Button styles, form styles, layout styles

**Key Styles:**
- Buttons (.btn)
- Forms (.form-group)
- Cards (.card)
- Tables
- Layout (header, container, columns)

---

### 9. **js/app.js** ⚠️ OPTIONAL BUT RECOMMENDED

**Status:** OPTIONAL (pages work without it)  
**What happens if missing:** Some UI features may not work smoothly

**Purpose:**
- Basic JavaScript utilities
- Form validation helpers
- UI interaction helpers

**Functions:**
- `validateForm()` - Form validation
- `confirmAction()` - Confirmation dialogs
- `toggleElement()` - Show/hide elements
- `updateProgressDisplay()` - Update progress display

---

## 🔗 File Dependencies

### Dependency Tree

```
config.php (MUST EXIST FIRST)
    │
    ├──→ login.php (requires config.php)
    ├──→ signup.php (requires config.php)
    ├──→ logout.php (requires config.php)
    ├──→ dashboard.php (requires config.php)
    └──→ admin.php (requires config.php)

index.html (standalone, links to login.php, signup.php)
styles.css (used by all PHP pages)
js/app.js (optional, used by some pages)
```

### Quick Check: Is File Essential?

**Ask yourself:**
1. Does any PHP file `require` or `require_once` this file? → **ESSENTIAL**
2. Is this file directly accessed via URL? → **ESSENTIAL**
3. Does this file provide core functionality? → **ESSENTIAL**
4. Is this just documentation or a helper script? → **OPTIONAL**

---

## 🛠️ Setup Instructions

### Step 1: Start XAMPP Services
1. Open XAMPP Control Panel
2. Start Apache (click "Start" button)
3. Start MySQL (click "Start" button)
4. Both should show "Running" status

### Step 2: Access the Application
**IMPORTANT:** Use one of these URLs:

- Option 1 (Recommended): `http://localhost/wtpro/`
- Option 2: `http://127.0.0.1/wtpro/`
- Option 3: `http://localhost/wtpro/index.html`

**DO NOT:**
- Double-click index.html file
- Use file:/// path
- Open files directly from Windows Explorer

### Step 3: Test PHP
1. Visit: `http://localhost/wtpro/test.php`
2. You should see "PHP is working!" message
3. If you see the PHP code or it downloads, PHP is not configured

### Step 4: Database Setup
**Automatic:** Database and tables are auto-created on first use by `config.php`

**Manual Fix (if needed):**
- Visit: `http://localhost/wtpro/fix_collation.php`
- This fixes collation issues in existing database

### Step 5: First Login
**Admin Login:**
- Username: `admin`
- Password: `admin123`

Or create a new user account via Sign Up.

### Quick Start Checklist
- [ ] XAMPP Apache is running
- [ ] XAMPP MySQL is running
- [ ] Files are in `C:\xampp\htdocs\wtpro\`
- [ ] Accessing via `http://localhost/wtpro/`
- [ ] test.php shows "PHP is working!"

---

## 🔧 Troubleshooting

### Problem: PHP File Downloads Instead of Executing

**Symptom:** When you click "Login", the browser downloads `login.php` instead of showing the login page.

**Solution:**
1. Make sure Apache is running in XAMPP
2. Access via `http://localhost/wtpro/` NOT `file://`
3. Check that PHP is installed (test.php should work)
4. Check .htaccess file exists

**Why This Happens:**
- PHP files must be processed by a web server (Apache)
- When you double-click a file → Opens via `file://` protocol
- Browser doesn't know it's PHP → Downloads it
- When you access via `http://localhost/` → Apache processes PHP → Displays correctly

### Problem: "Database connection failed"

**Solution:**
- Make sure MySQL is running in XAMPP
- Database will be auto-created on first use

### Problem: "404 Not Found"

**Solution:**
- Check that files are in: `C:\xampp\htdocs\wtpro\`
- Use correct URL: `http://localhost/wtpro/`

### Problem: "Illegal mix of collations"

**Solution:**
1. Visit: `http://localhost/wtpro/fix_collation.php`
2. Wait for "Collation fix complete!" message
3. Try accessing admin.php again

### Problem: "require_once 'config.php' failed"

**Solution:**
- Make sure config.php exists in same directory
- Check file permissions

### Problem: "Headers already sent"

**Solution:**
- No output before header() redirects
- Check for spaces before `<?php` tag

### Problem: Port 80 Already in Use

**Solution:**
- Close Skype or other programs using port 80
- Or change Apache port in XAMPP settings

---

## 💾 Database Information

### Auto-Created Database
- **Database Name:** `teamflow`
- **Auto-created:** Yes (on first connection)
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

### Database Tables

#### users Table
```sql
id VARCHAR(50) PRIMARY KEY
firstName VARCHAR(100)
email VARCHAR(100) UNIQUE
gender VARCHAR(20)
password VARCHAR(255)
username VARCHAR(100)
experience VARCHAR(10)
skills TEXT (JSON array)
qualifications TEXT (JSON array)
projects TEXT (JSON array of project IDs)
createdAt DATETIME
```

#### projects Table
```sql
id VARCHAR(50) PRIMARY KEY
name VARCHAR(200)
description TEXT
assignedUsers TEXT (JSON array of user IDs)
status VARCHAR(20)
progress INT
createdAt DATETIME
```

#### tasks Table
```sql
id VARCHAR(50) PRIMARY KEY
projectId VARCHAR(50)
userId VARCHAR(50)
title VARCHAR(200)
description TEXT
taskType VARCHAR(50)
priority VARCHAR(20)
status VARCHAR(20)
progress INT
dueDate DATE
createdAt DATETIME
updatedAt DATETIME
```

### Session Variables Used

```php
$_SESSION['isLoggedIn']  // Boolean - is user logged in?
$_SESSION['userType']    // 'admin' or 'user'
$_SESSION['username']     // Username for display
$_SESSION['userId']       // User ID for database queries
```

---

## 🔄 Code Flow Examples

### 1. User Login Flow
```
User clicks "Login" in index.html
    ↓
Opens login.php
    ↓
login.php requires config.php
    ↓
config.php: Starts session, provides DB connection
    ↓
User submits form (POST)
    ↓
login.php: Checks credentials
    ↓
If valid: Sets session, redirects to dashboard.php
    ↓
dashboard.php requires config.php
    ↓
config.php: requireLogin() checks session
    ↓
dashboard.php: Loads user data from database
    ↓
Displays dashboard HTML
```

### 2. Admin Task Creation Flow
```
Admin clicks "Create Task" in admin.php
    ↓
URL: admin.php?tab=tasks&action=create
    ↓
admin.php shows create form
    ↓
Admin submits form (POST)
    ↓
admin.php processes POST (createTask)
    ↓
Inserts into database
    ↓
Redirects to admin.php?tab=tasks
    ↓
Shows success message and task list
```

### 3. User Task Update Flow
```
User moves progress slider in dashboard.php
    ↓
Form auto-submits (POST to dashboard.php)
    ↓
dashboard.php processes POST (updateTask)
    ↓
Updates task in database
    ↓
Updates project progress
    ↓
Redirects to dashboard.php
    ↓
Shows updated progress
```

### Code Pattern

Every page follows this pattern:
```php
<?php
// 1. Require config
require_once 'config.php';
requireLogin(); // or requireAdmin()

// 2. Handle POST (form submissions)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Process form
    // Update database
    // Set message
    // Redirect or show success
}

// 3. Handle GET (display data)
// Get data from database
// Display HTML with embedded PHP
?>
```

---

## 🌐 URL Patterns

### User URLs
- `login.php` - Login page
- `signup.php` - Signup page
- `dashboard.php` - User dashboard
- `dashboard.php?edit=profile` - Edit profile form
- `logout.php` - Logout (redirects)

### Admin URLs
- `admin.php` - Admin dashboard (default: users tab)
- `admin.php?tab=users` - View users
- `admin.php?tab=projects` - View projects
- `admin.php?tab=projects&action=create` - Create project form
- `admin.php?tab=assign` - Assign projects
- `admin.php?tab=tasks` - View tasks
- `admin.php?tab=tasks&action=create` - Create task form
- `admin.php?tab=tasks&action=edit&taskId=xxx` - Edit task form
- `admin.php?tab=tasks&action=delete&taskId=xxx` - Delete task

---

## ✨ Features

### User Features (dashboard.php)
- ✅ View profile and progress statistics
- ✅ Edit profile (experience, skills, qualifications)
- ✅ View assigned projects
- ✅ View and update task progress
- ✅ View all tasks in assigned projects

### Admin Features (admin.php)
- ✅ View all registered users
- ✅ Create and manage projects
- ✅ Assign projects to users
- ✅ Create, edit, and delete tasks

---

## 🛠️ Technology Stack

- **PHP** - Server-side logic (no frameworks)
- **MySQL** - Database (auto-created)
- **HTML** - Structure
- **CSS** - Styling
- **JavaScript** - Basic utilities only (no AJAX)

---

## 🎯 Key Principles

- ✅ **No AJAX** - Traditional form submissions
- ✅ **No Frameworks** - Pure PHP/HTML/CSS/JS
- ✅ **Single File Pattern** - Each main page handles all its operations
- ✅ **Simple Code** - Easy to read and modify
- ✅ **URL Parameters** - Control display (?tab=users, ?action=create)
- ✅ **Server-side Rendering** - All data fetched in PHP, embedded in HTML
- ✅ **Simple Redirects** - After form submission, PHP redirects

---

## 📝 File Modification Impact

| If You Modify | Affects |
|---------------|---------|
| config.php | ALL PHP files (database, sessions, auth) |
| styles.css | ALL pages (appearance) |
| login.php | Login functionality only |
| dashboard.php | User interface only |
| admin.php | Admin interface only |
| js/app.js | UI interactions (optional) |

---

## ✅ Testing Checklist

After modifying files, test:
- [ ] Can access index.html
- [ ] Can login as admin
- [ ] Can login as user
- [ ] Can signup new user
- [ ] Can view dashboard
- [ ] Can view admin panel
- [ ] Can create project (admin)
- [ ] Can assign project (admin)
- [ ] Can create task (admin)
- [ ] Can update task progress (user)
- [ ] Can edit profile (user)
- [ ] Can logout

---

## 💡 Pro Tips

1. **Always keep config.php** - Everything depends on it
2. **Test after deleting files** - Make sure nothing breaks
3. **Keep backups** - Before deleting old files
4. **Check dependencies** - Use grep to find `require` statements
5. **Use http://localhost/** - Never use file:/// for PHP files

---

## 📊 File Priority Summary

| Priority | Files | Can Delete? |
|----------|-------|-------------|
| **CRITICAL** | config.php, login.php, signup.php, logout.php, dashboard.php, admin.php, index.html, styles.css | ❌ NO |
| **IMPORTANT** | js/app.js, .htaccess | ⚠️ Not recommended |
| **HELPFUL** | index.php, test.php | ✅ Yes, but useful |
| **OPTIONAL** | fix_collation.php | ✅ Yes (one-time use) |

---

## 🚨 Common Errors If Files Missing

| Missing File | Error You'll See |
|--------------|------------------|
| config.php | `Fatal error: require_once 'config.php' failed` |
| login.php | Cannot log in (404 or broken link) |
| dashboard.php | Users redirected but no page exists |
| admin.php | Admin redirected but no page exists |
| styles.css | Pages work but look unstyled |
| Database not created | `Database connection failed` |

---

## 📚 Usage Examples

### User Dashboard
- View tasks: `dashboard.php`
- Edit profile: `dashboard.php?edit=profile`
- Update task: Form submits to `dashboard.php`

### Admin Dashboard
- View users: `admin.php?tab=users`
- Create project: `admin.php?tab=projects&action=create`
- Assign project: `admin.php?tab=assign`
- Create task: `admin.php?tab=tasks&action=create`
- Edit task: `admin.php?tab=tasks&action=edit&taskId=xxx`
- Delete task: `admin.php?tab=tasks&action=delete&taskId=xxx`

---

## 🎓 Learning Points

This project demonstrates:
- Basic PHP form handling
- Session management
- MySQL database operations
- Simple CRUD operations
- Traditional web application flow

Perfect for beginners learning PHP and web development!

---

## 📄 License

Free to use and modify.

---

**Note**: This is a simplified version designed for learning. For production use, consider adding:
- Password hashing
- Input sanitization improvements
- Error handling
- Security enhancements

---

**Last Updated:** All documentation merged into this single file for easy reference.

