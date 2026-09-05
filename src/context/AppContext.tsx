import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, ActivityLog, TaskStatus, UserSkill } from '../types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_ACTIVITIES } from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  projects: Project[];
  tasks: Task[];
  activities: ActivityLog[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  addToast: (title: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'progress' | 'assignedMemberIds'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  assignMemberToProject: (projectId: string, userId: string) => void;
  removeMemberFromProject: (projectId: string, userId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, newStatus: TaskStatus) => void;
  updateUserSkills: (userId: string, skills: UserSkill[]) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'tf_users_v2',
  PROJECTS: 'tf_projects_v2',
  TASKS: 'tf_tasks_v2',
  ACTIVITIES: 'tf_activities_v2',
  CURRENT_USER: 'tf_current_user_v2',
  THEME: 'tf_theme_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  const addToast = (title: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    addToast(`Switched perspective to ${user.name} (${user.role.toUpperCase()})`, 'info');
  };

  const logActivity = (type: ActivityLog['type'], title: string, description: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      title,
      description,
      timestamp: 'Just now',
      actorName: currentUser.name
    };
    setActivities(prev => [newLog, ...prev.slice(0, 19)]);
  };

  const addProject = (projectData: Omit<Project, 'id' | 'progress' | 'assignedMemberIds'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      progress: 0,
      assignedMemberIds: projectData.leadId ? [projectData.leadId] : []
    };
    setProjects(prev => [newProject, ...prev]);
    logActivity('project_created', 'New Project Created', `${currentUser.name} created "${newProject.title}"`);
    addToast(`Project "${newProject.title}" initialized successfully!`, 'success');
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    addToast('Project details updated', 'success');
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    addToast(`Project "${project?.title || 'Selected'}" deleted`, 'warning');
  };

  const assignMemberToProject = (projectId: string, userId: string) => {
    const project = projects.find(p => p.id === projectId);
    const member = users.find(u => u.id === userId);
    if (!project || !member) return;

    if (project.assignedMemberIds.includes(userId)) {
      addToast(`${member.name} is already assigned to this project`, 'info');
      return;
    }

    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, assignedMemberIds: [...p.assignedMemberIds, userId] }
          : p
      )
    );

    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? {
              ...u,
              assignedProjectIds: [...u.assignedProjectIds, projectId],
              currentWorkloadHours: Math.min(40, u.currentWorkloadHours + 8)
            }
          : u
      )
    );

    logActivity(
      'member_assigned',
      'Team Member Assigned',
      `${currentUser.name} assigned ${member.name} to "${project.title}"`
    );
    addToast(`Assigned ${member.name} to ${project.title}`, 'success');
  };

  const removeMemberFromProject = (projectId: string, userId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, assignedMemberIds: p.assignedMemberIds.filter(id => id !== userId) }
          : p
      )
    );

    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? {
              ...u,
              assignedProjectIds: u.assignedProjectIds.filter(id => id !== projectId),
              currentWorkloadHours: Math.max(0, u.currentWorkloadHours - 8)
            }
          : u
      )
    );
    addToast('Member unassigned from project', 'info');
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    recalculateProjectProgress(newTask.projectId);
    addToast(`Task "${newTask.title}" added to board`, 'success');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    addToast('Task updated', 'success');
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task) {
      recalculateProjectProgress(task.projectId);
    }
    addToast('Task removed', 'info');
  };

  const moveTaskStatus = (id: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));
    logActivity('task_moved', 'Task Status Updated', `${currentUser.name} moved "${task.title}" to ${newStatus.replace('_', ' ').toUpperCase()}`);
    recalculateProjectProgress(task.projectId);
  };

  const recalculateProjectProgress = (projectId: string) => {
    setTimeout(() => {
      setTasks(currentTasks => {
        const projTasks = currentTasks.filter(t => t.projectId === projectId);
        if (projTasks.length === 0) return currentTasks;
        const completed = projTasks.filter(t => t.status === 'completed').length;
        const progress = Math.round((completed / projTasks.length) * 100);
        setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, progress } : p)));
        return currentTasks;
      });
    }, 50);
  };

  const updateUserSkills = (userId: string, skills: UserSkill[]) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, skills } : u)));
    if (currentUser.id === userId) {
      setCurrentUserState(prev => ({ ...prev, skills }));
    }
    logActivity('skill_updated', 'Skill Matrix Updated', `${currentUser.name} updated technical competencies`);
    addToast('Skills portfolio saved', 'success');
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setActivities(INITIAL_ACTIVITIES);
    setCurrentUserState(INITIAL_USERS[0]);
    setTheme('dark');
    addToast('Reset application to original showcase dataset', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        projects,
        tasks,
        activities,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        addProject,
        updateProject,
        deleteProject,
        assignMemberToProject,
        removeMemberFromProject,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        updateUserSkills,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
