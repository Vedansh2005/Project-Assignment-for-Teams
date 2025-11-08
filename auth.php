<?php
// Allow CORS and set proper headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';

// Get action from POST or GET
$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Check admin credentials
    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        $_SESSION['isLoggedIn'] = true;
        $_SESSION['userType'] = 'admin';
        $_SESSION['username'] = $username;
        echo json_encode(['success' => true, 'userType' => 'admin', 'message' => 'Login successful']);
        exit;
    }
    
    // Check user credentials
    $conn = getDBConnection();
    if ($conn) {
        $stmt = $conn->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?");
        $stmt->bind_param("sss", $username, $username, $password);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($user = $result->fetch_assoc()) {
            $_SESSION['isLoggedIn'] = true;
            $_SESSION['userType'] = 'user';
            $_SESSION['username'] = $username;
            $_SESSION['userId'] = $user['id'];
            echo json_encode(['success' => true, 'userType' => 'user', 'message' => 'Login successful', 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        }
        $stmt->close();
        $conn->close();
    } else {
        // File-based fallback
        $users = readJSONFile('users.json');
        $user = null;
        foreach ($users as $u) {
            if (($u['username'] === $username || $u['email'] === $username) && $u['password'] === $password) {
                $user = $u;
                break;
            }
        }
        
        if ($user) {
            $_SESSION['isLoggedIn'] = true;
            $_SESSION['userType'] = 'user';
            $_SESSION['username'] = $username;
            $_SESSION['userId'] = $user['id'];
            echo json_encode(['success' => true, 'userType' => 'user', 'message' => 'Login successful', 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        }
    }
    
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    
} elseif ($action === 'check') {
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn']) {
        echo json_encode([
            'success' => true,
            'isLoggedIn' => true,
            'userType' => $_SESSION['userType'] ?? '',
            'username' => $_SESSION['username'] ?? ''
        ]);
    } else {
        echo json_encode(['success' => false, 'isLoggedIn' => false]);
    }
} else {
    // Return proper response for empty or invalid actions
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing action']);
}
?>

