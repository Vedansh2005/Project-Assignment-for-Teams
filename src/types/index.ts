export type Role = 'admin' | 'member';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface UserSkill {
  name: string;
  level: SkillLevel;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatarUrl?: string;
  avatarGradient: string;
  department: string;
  experienceYears: number;
  bio: string;
  skills: UserSkill[];
  availabilityHoursPerWeek: number;
  currentWorkloadHours: number;
  assignedProjectIds: string[];
}

export type ProjectStatus = 'planning' | 'active' | 'review' | 'completed';
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  startDate: string;
  deadline: string;
  requiredSkills: string[];
  leadId?: string;
  assignedMemberIds: string[];
  progress: number; // 0 to 100
}

export type TaskStatus = 'backlog' | 'in_progress' | 'in_review' | 'completed';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assignedToId?: string;
  dueDate: string;
  estimatedHours: number;
  tags: string[];
  createdAt: string;
}

export interface SmartMatchResult {
  member: User;
  matchScore: number; // 0 - 100
  matchingSkills: string[];
  missingSkills: string[];
  workloadStatus: 'available' | 'optimal' | 'overloaded';
  fitSummary: string;
}

export interface ActivityLog {
  id: string;
  type: 'project_created' | 'task_moved' | 'member_assigned' | 'skill_updated';
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
}
