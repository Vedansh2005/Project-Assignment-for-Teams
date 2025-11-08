<?php
/**
 * Fix Collation Script
 * Run this once to fix collation issues in existing database
 * Access via: http://localhost/wtpro/fix_collation.php
 */

require_once 'config.php';

// Only allow if accessed directly (not from browser in production)
// For now, we'll allow it for easy fixing

$conn = getDBConnection();

if (!$conn) {
    die("Database connection failed!");
}

echo "<h2>Fixing Database Collation...</h2>";

// Fix database collation
$conn->query("ALTER DATABASE " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "<p>✓ Database collation updated</p>";

// Fix users table
$conn->query("ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "<p>✓ Users table collation fixed</p>";

// Fix projects table
$conn->query("ALTER TABLE projects CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "<p>✓ Projects table collation fixed</p>";

// Fix tasks table
$conn->query("ALTER TABLE tasks CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "<p>✓ Tasks table collation fixed</p>";

// Fix specific columns that might have issues
$conn->query("ALTER TABLE users MODIFY id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$conn->query("ALTER TABLE projects MODIFY id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$conn->query("ALTER TABLE tasks MODIFY id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$conn->query("ALTER TABLE tasks MODIFY projectId VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$conn->query("ALTER TABLE tasks MODIFY userId VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

echo "<p>✓ All ID columns collation fixed</p>";

$conn->close();

echo "<h3 style='color: green;'>✓ Collation fix complete!</h3>";
echo "<p><a href='admin.php'>Go to Admin Dashboard</a></p>";
echo "<p><a href='index.html'>Go to Home</a></p>";
?>

