<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'teamflow');
define('DB_USER', 'root');
define('DB_PASS', '');

// Admin credentials
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database connection
function getDBConnection() {
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        // Try to create database if it doesn't exist
        $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS);
        if (!$conn->connect_error) {
            @$conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            @$conn->select_db(DB_NAME);
            createTables($conn);
        } else {
            return null;
        }
    } else {
        // Set charset for connection
        @$conn->set_charset("utf8mb4");
        createTables($conn);
    }
    return $conn;
}

// Create database tables
function createTables($conn) {
    if (!$conn) return;
    
    // Set default charset and collation
    @$conn->query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // Users table
    @$conn->query("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
        firstName VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE,
        gender VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        username VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        experience VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        skills TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        qualifications TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        projects TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        createdAt DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Projects table
    @$conn->query("CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
        name VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        assignedUsers TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        status VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        progress INT,
        createdAt DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Tasks table
    @$conn->query("CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
        projectId VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        userId VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        title VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        taskType VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        priority VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        status VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        progress INT,
        dueDate DATE,
        createdAt DATETIME,
        updatedAt DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true;
}

// Check if user is admin
function isAdmin() {
    return isset($_SESSION['userType']) && $_SESSION['userType'] === 'admin';
}

// Require login
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

// Require admin
function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        header('Location: dashboard.php');
        exit;
    }
}

// Get current user ID
function getCurrentUserId() {
    return $_SESSION['userId'] ?? null;
}

// Get current username
function getCurrentUsername() {
    return $_SESSION['username'] ?? null;
}

?>
