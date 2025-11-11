<?php
require_once 'config.php';

$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Check admin credentials
    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        $_SESSION['isLoggedIn'] = true;
        $_SESSION['userType'] = 'admin';
        $_SESSION['username'] = $username;
        header('Location: admin.php');
        exit;
    }
    
    // Check user credentials
    $conn = getDBConnection();
    if ($conn) {
        $username = mysqli_real_escape_string($conn, $username);
        $password = mysqli_real_escape_string($conn, $password);
        $query = "SELECT * FROM users WHERE (username = '$username' OR email = '$username') AND password = '$password'";
        $result = mysqli_query($conn, $query);
        
        if ($user = mysqli_fetch_assoc($result)) {
            $_SESSION['isLoggedIn'] = true;
            $_SESSION['userType'] = 'user';
            $_SESSION['username'] = $username;
            $_SESSION['userId'] = $user['id'];
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Invalid username or password';
        }
        mysqli_close($conn);
    } else {
        $error = 'Database connection failed';
    }
}

// If already logged in, redirect
if (isLoggedIn()) {
    if (isAdmin()) {
        header('Location: admin.php');
    } else {
        header('Location: dashboard.php');
    }
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>Login - TeamFlow</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      background-color: #f5f5f5;
      padding: 20px;
    }
    .login-container {
      width: 400px;
      margin: 100px auto;
      background-color: white;
      padding: 30px;
      border: 1px solid #ddd;
    }
    h2 {
      text-align: center;
      color: #333;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .error {
      background-color: #fee2e2;
      color: #991b1b;
      padding: 10px;
      margin-bottom: 15px;
      display: <?php echo $error ? 'block' : 'none'; ?>;
    }
    .links {
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h2>Login</h2>
    <p style="text-align: center; color: #666;">Welcome back to TeamFlow</p>
    
    <?php if ($error): ?>
    <div class="error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <form method="POST" action="login.php">
      <div class="form-group">
        <label>Username or Email</label>
        <input type="text" name="username" required>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" name="password" required>
      </div>
      <button type="submit" class="btn" style="width: 100%;">Login</button>
    </form>
    
    <div class="links">
      <p>Don't have an account? <a href="signup.php">Sign up</a></p>
      <p><a href="index.html">Back to Home</a></p>
    </div>
  </div>
</body>
</html>

