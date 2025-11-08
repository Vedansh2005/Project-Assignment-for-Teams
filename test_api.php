<?php
// Simple API test endpoint to diagnose 405 errors
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? 'test';

echo json_encode([
    'success' => true,
    'message' => 'API is working',
    'method' => $method,
    'action' => $action,
    'post' => $_POST,
    'get' => $_GET,
    'server' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? '',
        'HTTP_ACCEPT' => $_SERVER['HTTP_ACCEPT'] ?? ''
    ]
]);
?>

