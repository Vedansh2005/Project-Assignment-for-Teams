<?php
// Quick database connection test
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing database connection...<br>";

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'teamflow';

// Test 1: Basic connection
echo "1. Testing basic connection...<br>";
$start = microtime(true);
$conn = @mysqli_connect($host, $user, $pass);
$time = round((microtime(true) - $start) * 1000, 2);

if ($conn) {
    echo "✓ Connected in {$time}ms<br>";
    mysqli_close($conn);
} else {
    echo "✗ Connection failed: " . mysqli_connect_error() . "<br>";
    echo "Make sure MySQL is running in XAMPP!<br>";
    exit;
}

// Test 2: Database connection
echo "<br>2. Testing database connection...<br>";
$start = microtime(true);
$conn = @mysqli_connect($host, $user, $pass, $db);
$time = round((microtime(true) - $start) * 1000, 2);

if ($conn) {
    echo "✓ Database connected in {$time}ms<br>";
    mysqli_close($conn);
} else {
    echo "✗ Database connection failed: " . mysqli_connect_error() . "<br>";
}

// Test 3: Query test
echo "<br>3. Testing query...<br>";
$conn = @mysqli_connect($host, $user, $pass, $db);
if ($conn) {
    $start = microtime(true);
    $result = @mysqli_query($conn, "SELECT 1");
    $time = round((microtime(true) - $start) * 1000, 2);
    
    if ($result) {
        echo "✓ Query executed in {$time}ms<br>";
        mysqli_free_result($result);
    } else {
        echo "✗ Query failed: " . mysqli_error($conn) . "<br>";
    }
    mysqli_close($conn);
}

echo "<br><strong>If all tests pass, the database is working correctly.</strong><br>";
echo "If any test fails, check XAMPP MySQL service is running.<br>";
?>



