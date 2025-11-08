// Authentication Functions
// Admin credentials (in a real app, this would be on a server)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Get users from localStorage or initialize with default users
function getUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Handle login
function handleLogin(username, password) {
  // Check admin credentials
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return {
      success: true,
      userType: 'admin',
      message: 'Login successful'
    };
  }
  
  // Check user credentials
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

// Handle signup
function handleSignup(firstName, email, gender, password, experience, skills, qualifications) {
  const users = getUsers();
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    firstName: firstName,
    email: email,
    gender: gender,
    password: password,
    username: email.split('@')[0], // Use email prefix as username
    experience: experience || '0',
    skills: skills || [],
    qualifications: qualifications || [],
    projects: [], // Projects assigned by admin
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
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userType');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

// Get projects from localStorage
function getProjects() {
  const projects = localStorage.getItem('projects');
  return projects ? JSON.parse(projects) : [];
}

// Save projects to localStorage
function saveProjects(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// Create a new project
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

// Assign user to project
function assignUserToProject(userId, projectId) {
  const users = getUsers();
  const projects = getProjects();
  
  const user = users.find(u => u.id === userId);
  const project = projects.find(p => p.id === projectId);
  
  if (!user || !project) return false;
  
  // Initialize arrays if they don't exist
  if (!user.projects) {
    user.projects = [];
  }
  if (!project.assignedUsers) {
    project.assignedUsers = [];
  }
  
  // Add project to user's projects if not already assigned
  if (user.projects.indexOf(projectId) === -1) {
    user.projects.push(projectId);
  }
  
  // Add user to project's assigned users if not already assigned
  if (project.assignedUsers.indexOf(userId) === -1) {
    project.assignedUsers.push(userId);
  }
  
  saveUsers(users);
  saveProjects(projects);
  return true;
}

// Remove user from project
function removeUserFromProject(userId, projectId) {
  const users = getUsers();
  const projects = getProjects();
  
  const user = users.find(u => u.id === userId);
  const project = projects.find(p => p.id === projectId);
  
  if (!user || !project) return false;
  
  // Initialize arrays if they don't exist
  if (!user.projects) {
    user.projects = [];
  }
  if (!project.assignedUsers) {
    project.assignedUsers = [];
  }
  
  // Remove project from user
  const userProjectIndex = user.projects.indexOf(projectId);
  if (userProjectIndex > -1) {
    user.projects.splice(userProjectIndex, 1);
  }
  
  // Remove user from project
  const projectUserIndex = project.assignedUsers.indexOf(userId);
  if (projectUserIndex > -1) {
    project.assignedUsers.splice(projectUserIndex, 1);
  }
  
  saveUsers(users);
  saveProjects(projects);
  return true;
}

// Update user profile
function updateUserProfile(userId, experience, skills, qualifications) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return {
      success: false,
      message: 'User not found'
    };
  }
  
  // Update user data
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
  // Check authentication on protected pages
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'admin.html') {
    if (!requireAuth('admin')) return;
  } else if (currentPage === 'dashboard.html' || currentPage === 'messages.html') {
    if (!requireAuth('user')) return;
  }
  
  // Handle tab switching
  initTabs();
  
  // Handle dialog modals
  initDialogs();
  
  // Handle message sending
  initMessages();
  
  // Handle admin functionality
  initAdmin();
});

// Tab functionality
function initTabs() {
  const tabTriggers = document.querySelectorAll('.tabs-trigger');
  const tabPanels = document.querySelectorAll('.tabs-panel');
  
  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetValue = trigger.getAttribute('data-value');
      
      // Remove active class from all triggers
      tabTriggers.forEach(t => t.classList.remove('active'));
      // Add active class to clicked trigger
      trigger.classList.add('active');
      
      // Hide all panels
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Show target panel
      const targetPanel = document.querySelector(`[data-panel="${targetValue}"]`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// Dialog/Modal functionality
function initDialogs() {
  const dialogTriggers = document.querySelectorAll('[data-dialog-trigger]');
  const dialogCloses = document.querySelectorAll('[data-dialog-close]');
  
  dialogTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const dialogId = trigger.getAttribute('data-dialog-trigger');
      const dialog = document.getElementById(dialogId);
      if (dialog) {
        dialog.classList.add('active');
      }
    });
  });
  
  dialogCloses.forEach(close => {
    close.addEventListener('click', () => {
      const dialog = close.closest('.dialog');
      if (dialog) {
        dialog.classList.remove('active');
      }
    });
  });
  
  // Close dialog on overlay click
  document.querySelectorAll('.dialog-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const dialog = overlay.closest('.dialog');
        if (dialog) {
          dialog.classList.remove('active');
        }
      }
    });
  });
}

// Messages functionality
function initMessages() {
  const sendButton = document.getElementById('send-message');
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('messages-container');
  
  if (sendButton && messageInput && messagesContainer) {
    sendButton.addEventListener('click', handleSendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }
  
  // Chat selection
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.addEventListener('click', () => {
      chatItems.forEach(ci => ci.classList.remove('active'));
      item.classList.add('active');
      
      // In a real app, you would load different messages here
      // For now, we'll just show the chat area
      const chatArea = document.querySelector('.chat-area');
      if (chatArea) {
        chatArea.style.display = 'flex';
      }
    });
  });
}

function handleSendMessage() {
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('messages-container');
  
  if (!messageInput || !messagesContainer) return;
  
  const messageText = messageInput.value.trim();
  if (!messageText) return;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'flex justify-end';
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message own max-w-[70%] rounded-lg p-3';
  
  messageContent.innerHTML = `
    <p class="text-sm">${escapeHtml(messageText)}</p>
    <p class="text-xs opacity-70 mt-1">${timeString}</p>
  `;
  
  messageDiv.appendChild(messageContent);
  messagesContainer.appendChild(messageDiv);
  
  messageInput.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Admin functionality
function initAdmin() {
  // Add project
  const addProjectBtn = document.getElementById('add-project-btn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', handleAddProject);
  }
  
  // Delete project
  document.querySelectorAll('[data-delete-project]').forEach(btn => {
    btn.addEventListener('click', function() {
      const projectId = this.getAttribute('data-delete-project');
      handleDeleteProject(projectId);
    });
  });
  
  // Add skill
  document.querySelectorAll('[data-add-skill]').forEach(btn => {
    btn.addEventListener('click', function() {
      const userId = this.getAttribute('data-add-skill');
      handleAddSkill(userId);
    });
  });
  
  // Remove skill - handled by clicking on skill badges
  document.querySelectorAll('[data-skills-container]').forEach(container => {
    container.addEventListener('click', function(e) {
      const badge = e.target.closest('.badge');
      if (badge && badge.querySelector('svg')) {
        badge.remove();
        showToast('Skill removed', 'success');
      }
    });
  });
}

function handleAddProject() {
  const nameInput = document.getElementById('project-name');
  const descInput = document.getElementById('project-description');
  
  if (!nameInput || !descInput) return;
  
  const name = nameInput.value.trim();
  const description = descInput.value.trim();
  
  if (!name || !description) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer) return;
  
  const projectCard = document.createElement('div');
  projectCard.className = 'card p-6';
  projectCard.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-lg font-semibold mb-1">${escapeHtml(name)}</h3>
        <p class="text-sm text-muted">${escapeHtml(description)}</p>
      </div>
      <button class="btn btn-ghost btn-icon" data-delete-project="${Date.now()}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>
    </div>
    <div class="space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-muted">Team Size</span>
        <span class="font-medium">0 members</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted">Status</span>
        <span class="badge badge-secondary">active</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted">Progress</span>
        <span class="font-medium">0%</span>
      </div>
    </div>
  `;
  
  projectsContainer.appendChild(projectCard);
  
  // Add delete handler to new button
  const deleteBtn = projectCard.querySelector('[data-delete-project]');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      projectCard.remove();
      showToast('Project deleted', 'success');
    });
  }
  
  // Close dialog
  const dialog = document.getElementById('new-project-dialog');
  if (dialog) {
    dialog.classList.remove('active');
  }
  
  // Clear inputs
  nameInput.value = '';
  descInput.value = '';
  
  showToast('Project created successfully', 'success');
}

function handleDeleteProject(projectId) {
  const projectCard = document.querySelector(`[data-delete-project="${projectId}"]`)?.closest('.card');
  if (projectCard) {
    projectCard.remove();
    showToast('Project deleted', 'success');
  }
}

function handleAddSkill(userId) {
  const skillInput = document.querySelector(`[data-skill-input="${userId}"]`);
  if (!skillInput) return;
  
  const skill = skillInput.value.trim();
  if (!skill) {
    showToast('Please enter a skill', 'error');
    return;
  }
  
  const skillsContainer = document.querySelector(`[data-skills-container="${userId}"]`);
  if (!skillsContainer) return;
  
  const skillBadge = document.createElement('span');
  skillBadge.className = 'badge badge-secondary cursor-pointer';
  skillBadge.innerHTML = `
    ${escapeHtml(skill)}
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 0.25rem;">
      <path d="M3 6h18"></path>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg>
  `;
  
  skillBadge.addEventListener('click', () => {
    skillBadge.remove();
    showToast('Skill removed', 'success');
  });
  
  skillsContainer.appendChild(skillBadge);
  skillInput.value = '';
  showToast('Skill added successfully', 'success');
}


// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background-color: ${type === 'success' ? '#22c55e' : '#ef4444'};
    color: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

