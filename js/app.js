// Authentication Functions - Fallback to localStorage
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Get users from localStorage (fallback)
function getUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

// Save users to localStorage (fallback)
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Handle login (fallback)
function handleLogin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return {
      success: true,
      userType: 'admin',
      message: 'Login successful'
    };
  }
  
  const users = getUsers();
  const user = users.find(u => 
    (u.username === username || u.email === username) && u.password === password
  );
  
  if (user) {
    return {
      success: true,
      userType: 'user',
      message: 'Login successful',
      user: user
    };
  }
  
  return {
    success: false,
    message: 'Invalid username or password'
  };
}

// Handle signup (fallback)
function handleSignup(firstName, email, gender, password, experience, skills, qualifications) {
  const users = getUsers();
  
  if (users.some(u => u.email === email)) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }
  
  const newUser = {
    id: Date.now().toString(),
    firstName: firstName,
    email: email,
    gender: gender,
    password: password,
    username: email.split('@')[0],
    experience: experience || '0',
    skills: skills || [],
    qualifications: qualifications || [],
    projects: [],
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return {
    success: true,
    message: 'Account created successfully',
    user: newUser
  };
}

// Check authentication
function checkAuth(requiredType) {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userType = localStorage.getItem('userType');
  
  if (!isLoggedIn || isLoggedIn !== 'true') {
    return false;
  }
  
  if (requiredType && userType !== requiredType) {
    return false;
  }
  
  return true;
}

// Redirect to login if not authenticated
function requireAuth(requiredType) {
  if (!checkAuth(requiredType)) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Logout function
function handleLogout() {
  fetch('auth.php?action=logout', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(function(response) {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Logout failed');
  })
  .catch(function(error) {
    // Fallback - continue with logout even if request fails
    console.log('Logout request failed, continuing with local logout');
  });
  
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userType');
  localStorage.removeItem('username');
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('userType');
  sessionStorage.removeItem('username');
  window.location.href = 'login.html';
}

// Get projects from localStorage (fallback)
function getProjects() {
  const projects = localStorage.getItem('projects');
  return projects ? JSON.parse(projects) : [];
}

// Save projects to localStorage (fallback)
function saveProjects(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// Create a new project (fallback)
function createProject(name, description) {
  const projects = getProjects();
  const newProject = {
    id: Date.now().toString(),
    name: name,
    description: description,
    assignedUsers: [],
    status: 'active',
    progress: 0,
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

// Assign user to project (fallback)
function assignUserToProject(userId, projectId) {
  const users = getUsers();
  const projects = getProjects();
  
  const user = users.find(u => u.id === userId);
  const project = projects.find(p => p.id === projectId);
  
  if (!user || !project) return false;
  
  if (!user.projects) {
    user.projects = [];
  }
  if (!project.assignedUsers) {
    project.assignedUsers = [];
  }
  
  if (user.projects.indexOf(projectId) === -1) {
    user.projects.push(projectId);
  }
  
  if (project.assignedUsers.indexOf(userId) === -1) {
    project.assignedUsers.push(userId);
  }
  
  saveUsers(users);
  saveProjects(projects);
  return true;
}

// Remove user from project (fallback)
function removeUserFromProject(userId, projectId) {
  const users = getUsers();
  const projects = getProjects();
  
  const user = users.find(u => u.id === userId);
  const project = projects.find(p => p.id === projectId);
  
  if (!user || !project) return false;
  
  if (!user.projects) {
    user.projects = [];
  }
  if (!project.assignedUsers) {
    project.assignedUsers = [];
  }
  
  const userProjectIndex = user.projects.indexOf(projectId);
  if (userProjectIndex > -1) {
    user.projects.splice(userProjectIndex, 1);
  }
  
  const projectUserIndex = project.assignedUsers.indexOf(userId);
  if (projectUserIndex > -1) {
    project.assignedUsers.splice(projectUserIndex, 1);
  }
  
  saveUsers(users);
  saveProjects(projects);
  return true;
}

// Update user profile (fallback)
function updateUserProfile(userId, experience, skills, qualifications) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return {
      success: false,
      message: 'User not found'
    };
  }
  
  user.experience = experience || '0';
  user.skills = skills || [];
  user.qualifications = qualifications || [];
  
  saveUsers(users);
  
  return {
    success: true,
    message: 'Profile updated successfully',
    user: user
  };
}

// Navigation and Routing
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'admin.html') {
    if (!requireAuth('admin')) return;
  } else if (currentPage === 'dashboard.html' || currentPage === 'messages.html') {
    if (!requireAuth('user')) return;
  }
});

