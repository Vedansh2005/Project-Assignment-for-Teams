<?php
// Set proper headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Start session if not already started (after headers are set)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'signup') {
    $firstName = $_POST['firstName'] ?? '';
    $email = $_POST['email'] ?? '';
    $gender = $_POST['gender'] ?? '';
    $password = $_POST['password'] ?? '';
    $experience = $_POST['experience'] ?? '0';
    $skills = json_decode($_POST['skills'] ?? '[]', true);
    $qualifications = json_decode($_POST['qualifications'] ?? '[]', true);
    
    $conn = getDBConnection();
    if ($conn) {
        // Check if email exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Email already registered']);
            exit;
        }
        
        $id = time() . rand(1000, 9999);
        $username = explode('@', $email)[0];
        $skillsJson = json_encode($skills);
        $qualificationsJson = json_encode($qualifications);
        $projectsJson = json_encode([]);
        $createdAt = date('Y-m-d H:i:s');
        
        $stmt = $conn->prepare("INSERT INTO users (id, firstName, email, gender, password, username, experience, skills, qualifications, projects, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssssssss", $id, $firstName, $email, $gender, $password, $username, $experience, $skillsJson, $qualificationsJson, $projectsJson, $createdAt);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Account created successfully', 'userId' => $id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error creating account']);
        }
        $stmt->close();
        $conn->close();
    } else {
        // File-based fallback
        $users = readJSONFile('users.json');
        foreach ($users as $u) {
            if ($u['email'] === $email) {
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
                exit;
            }
        }
        
        $newUser = [
            'id' => time() . rand(1000, 9999),
            'firstName' => $firstName,
            'email' => $email,
            'gender' => $gender,
            'password' => $password,
            'username' => explode('@', $email)[0],
            'experience' => $experience,
            'skills' => $skills,
            'qualifications' => $qualifications,
            'projects' => [],
            'createdAt' => date('Y-m-d H:i:s')
        ];
        
        $users[] = $newUser;
        writeJSONFile('users.json', $users);
        echo json_encode(['success' => true, 'message' => 'Account created successfully', 'userId' => $newUser['id']]);
    }
    
} elseif ($action === 'getAll') {
    $conn = getDBConnection();
    if ($conn) {
        $result = $conn->query("SELECT id, firstName, email, gender, username, experience, skills, qualifications, projects FROM users");
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $row['skills'] = json_decode($row['skills'], true) ?: [];
            $row['qualifications'] = json_decode($row['qualifications'], true) ?: [];
            $row['projects'] = json_decode($row['projects'], true) ?: [];
            $users[] = $row;
        }
        echo json_encode(['success' => true, 'users' => $users]);
        $conn->close();
    } else {
        $users = readJSONFile('users.json');
        foreach ($users as &$user) {
            unset($user['password']);
        }
        echo json_encode(['success' => true, 'users' => $users]);
    }
    
} elseif ($action === 'getCurrent') {
    $userId = $_SESSION['userId'] ?? $_GET['userId'] ?? '';
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        $stmt = $conn->prepare("SELECT id, firstName, email, gender, username, experience, skills, qualifications, projects FROM users WHERE id = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($user = $result->fetch_assoc()) {
            $user['skills'] = json_decode($user['skills'], true) ?: [];
            $user['qualifications'] = json_decode($user['qualifications'], true) ?: [];
            $user['projects'] = json_decode($user['projects'], true) ?: [];
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
        $stmt->close();
        $conn->close();
    } else {
        $users = readJSONFile('users.json');
        foreach ($users as $user) {
            if ($user['id'] === $userId) {
                unset($user['password']);
                echo json_encode(['success' => true, 'user' => $user]);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
    
} elseif ($action === 'update') {
    $userId = $_POST['userId'] ?? $_SESSION['userId'] ?? '';
    $experience = $_POST['experience'] ?? '';
    $skills = json_decode($_POST['skills'] ?? '[]', true);
    $qualifications = json_decode($_POST['qualifications'] ?? '[]', true);
    
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        $skillsJson = json_encode($skills);
        $qualificationsJson = json_encode($qualifications);
        $stmt = $conn->prepare("UPDATE users SET experience = ?, skills = ?, qualifications = ? WHERE id = ?");
        $stmt->bind_param("ssss", $experience, $skillsJson, $qualificationsJson, $userId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error updating profile']);
        }
        $stmt->close();
        $conn->close();
    } else {
        $users = readJSONFile('users.json');
        foreach ($users as &$user) {
            if ($user['id'] === $userId) {
                $user['experience'] = $experience;
                $user['skills'] = $skills;
                $user['qualifications'] = $qualifications;
                writeJSONFile('users.json', $users);
                echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} else {
    // Return proper response for empty or invalid actions
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing action']);
}
?>

