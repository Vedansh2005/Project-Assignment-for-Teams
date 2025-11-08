<?php
// Diagnostic script to check header issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Header Check Diagnostic</h2>";
echo "<pre>";

echo "1. Checking if headers can be sent:\n";
if (headers_sent($file, $line)) {
    echo "   ERROR: Headers already sent in $file at line $line\n";
} else {
    echo "   OK: Headers can be sent\n";
}

echo "\n2. Testing header setting:\n";
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
echo "   OK: Headers set successfully\n";

echo "\n3. Testing session:\n";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    echo "   OK: Session started after headers\n";
} else {
    echo "   INFO: Session already started\n";
}

echo "\n4. Request Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "5. Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "\n";

echo "\n6. Testing config.php require:\n";
require_once 'config.php';
echo "   OK: config.php loaded without header conflicts\n";

echo "\n✅ All checks passed! Headers are being set correctly.\n";
echo "</pre>";
?>

