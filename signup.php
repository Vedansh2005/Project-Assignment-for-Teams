<?php
require_once 'config.php';

$error = '';
$success = false;

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = $_POST['firstName'] ?? '';
    $email = $_POST['email'] ?? '';
    $gender = $_POST['gender'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $experience = $_POST['experience'] ?? '0';
    $skills = $_POST['skills'] ?? '';
    $qualifications = $_POST['qualifications'] ?? '';
    
    // Validation
    if ($password !== $confirmPassword) {
        $error = 'Passwords do not match';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long';
    } else {
        $conn = getDBConnection();
        if ($conn) {
            // Check if email exists
            $email = mysqli_real_escape_string($conn, $email);
            $result = mysqli_query($conn, "SELECT id FROM users WHERE email = '$email'");
            if (mysqli_num_rows($result) > 0) {
                $error = 'Email already registered';
            } else {
                // Create user
                $id = time() . rand(1000, 9999);
                $username = explode('@', $email)[0];
                $skillsArray = !empty($skills) ? explode(',', $skills) : [];
                $qualificationsArray = !empty($qualifications) ? explode("\n", $qualifications) : [];
                $qualificationsArray = array_map('trim', $qualificationsArray);
                $qualificationsArray = array_filter($qualificationsArray);
                
                $skillsJson = json_encode($skillsArray);
                $qualificationsJson = json_encode($qualificationsArray);
                $projectsJson = json_encode([]);
                $createdAt = date('Y-m-d H:i:s');
                
                $firstName = mysqli_real_escape_string($conn, $firstName);
                $gender = mysqli_real_escape_string($conn, $gender);
                $password = mysqli_real_escape_string($conn, $password);
                $username = mysqli_real_escape_string($conn, $username);
                $experience = mysqli_real_escape_string($conn, $experience);
                $skillsJson = mysqli_real_escape_string($conn, $skillsJson);
                $qualificationsJson = mysqli_real_escape_string($conn, $qualificationsJson);
                $projectsJson = mysqli_real_escape_string($conn, $projectsJson);
                
                $query = "INSERT INTO users (id, firstName, email, gender, password, username, experience, skills, qualifications, projects, createdAt) VALUES ('$id', '$firstName', '$email', '$gender', '$password', '$username', '$experience', '$skillsJson', '$qualificationsJson', '$projectsJson', '$createdAt')";
                
                if (mysqli_query($conn, $query)) {
                    $success = true;
                } else {
                    $error = 'Error creating account';
                }
            }
            mysqli_close($conn);
        } else {
            $error = 'Database connection failed';
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>Sign Up - TeamFlow</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      background-color: #f5f5f5;
      padding: 20px;
    }
    .signup-container {
      width: 500px;
      margin: 20px auto;
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
    .success {
      background-color: #d1fae5;
      color: #065f46;
      padding: 10px;
      margin-bottom: 15px;
      display: <?php echo $success ? 'block' : 'none'; ?>;
    }
    .links {
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <p style="text-align: center; color: #666;">Create your TeamFlow account</p>
    
    <?php if ($error): ?>
    <div class="error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <?php if ($success): ?>
    <div class="success">Account created successfully! Redirecting to login...</div>
    <script>
      setTimeout(function() {
        window.location.href = 'login.php';
      }, 2000);
    </script>
    <?php else: ?>
    
    <form method="POST" action="signup.php">
      <div class="form-group">
        <label>First Name</label>
        <input type="text" name="firstName" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" name="email" required>
      </div>
      <div class="form-group">
        <label>Gender</label>
        <select name="gender">
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Experience (in years)</label>
        <input type="number" name="experience" min="0" value="0">
      </div>
      <div class="form-group">
        <label>Skills (comma separated, e.g., PHP, JavaScript, MySQL)</label>
        <input type="text" name="skills" placeholder="PHP, JavaScript, MySQL">
      </div>
      <div class="form-group">
        <label>Qualifications (one per line)</label>
        <textarea name="qualifications" rows="3" placeholder="e.g., B.S. Computer Science&#10;AWS Certified"></textarea>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" name="password" required minlength="6">
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <input type="password" name="confirmPassword" required>
      </div>
      <button type="submit" class="btn" style="width: 100%;">Create Account</button>
    </form>
    
    <?php endif; ?>
    
    <div class="links">
      <p>Already have an account? <a href="login.php">Login</a></p>
      <p><a href="index.html">Back to Home</a></p>
    </div>
  </div>
</body>
</html>

