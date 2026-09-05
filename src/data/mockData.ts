import { User, Project, Task, ActivityLog, SmartMatchResult } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Alex Vance',
    email: 'admin@teamflow.io',
    role: 'admin',
    title: 'VP of Engineering & Team Lead',
    avatarGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    department: 'Engineering Leadership',
    experienceYears: 9,
    bio: 'Architecting scalable cloud distributed systems and coordinating cross-functional engineering teams.',
    skills: [
      { name: 'System Architecture', level: 'Expert' },
      { name: 'TypeScript', level: 'Expert' },
      { name: 'React', level: 'Advanced' },
      { name: 'Kubernetes', level: 'Advanced' },
      { name: 'PostgreSQL', level: 'Expert' }
    ],
    availabilityHoursPerWeek: 40,
    currentWorkloadHours: 26,
    assignedProjectIds: ['proj-1', 'proj-3']
  },
  {
    id: 'user-2',
    name: 'Sophia Chen',
    email: 'sophia.c@teamflow.io',
    role: 'member',
    title: 'Senior Frontend Engineer',
    avatarGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    department: 'Web & UI Engineering',
    experienceYears: 6,
    bio: 'Passionate about delightful micro-interactions, responsive systems, and design tokens.',
    skills: [
      { name: 'React', level: 'Expert' },
      { name: 'TypeScript', level: 'Expert' },
      { name: 'CSS/Sass', level: 'Expert' },
      { name: 'UI/UX Design', level: 'Advanced' },
      { name: 'Next.js', level: 'Advanced' }
    ],
    availabilityHoursPerWeek: 40,
    currentWorkloadHours: 32,
    assignedProjectIds: ['proj-1', 'proj-2']
  },
  {
    id: 'user-3',
    name: 'Marcus Brody',
    email: 'marcus.b@teamflow.io',
    role: 'member',
    title: 'Principal Cloud & DevOps Architect',
    avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    department: 'Platform Infrastructure',
    experienceYears: 8,
    bio: 'Specialist in high-throughput CI/CD pipelines, container orchestration, and multi-region AWS resilience.',
    skills: [
      { name: 'AWS', level: 'Expert' },
      { name: 'Docker', level: 'Expert' },
      { name: 'Kubernetes', level: 'Expert' },
      { name: 'Terraform', level: 'Advanced' },
      { name: 'Python', level: 'Advanced' }
    ],
    availabilityHoursPerWeek: 40,
    currentWorkloadHours: 18,
    assignedProjectIds: ['proj-3']
  },
  {
    id: 'user-4',
    name: 'Elena Rostova',
    email: 'elena.r@teamflow.io',
    role: 'member',
    title: 'Lead AI/ML Research Engineer',
    avatarGradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    department: 'Machine Intelligence',
    experienceYears: 5,
    bio: 'Building predictive LLM pipelines, vector embeddings, and real-time semantic retrieval.',
    skills: [
      { name: 'Python', level: 'Expert' },
      { name: 'PyTorch', level: 'Expert' },
      { name: 'FastAPI', level: 'Advanced' },
      { name: 'PostgreSQL', level: 'Advanced' },
      { name: 'Vector DBs', level: 'Expert' }
    ],
    availabilityHoursPerWeek: 40,
    currentWorkloadHours: 24,
    assignedProjectIds: ['proj-1']
  },
  {
    id: 'user-5',
    name: 'Devon Miller',
    email: 'devon.m@teamflow.io',
    role: 'member',
    title: 'Full-Stack Security Specialist',
    avatarGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    department: 'Cybersecurity & Auth',
    experienceYears: 4,
    bio: 'Focusing on Zero-Trust identity providers, OAuth 2.1, cryptography, and penetration testing.',
    skills: [
      { name: 'Node.js', level: 'Advanced' },
      { name: 'OAuth / Auth0', level: 'Expert' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'PostgreSQL', level: 'Intermediate' },
      { name: 'Go', level: 'Intermediate' }
    ],
    availabilityHoursPerWeek: 40,
    currentWorkloadHours: 12,
    assignedProjectIds: ['proj-4']
  },
  {
    id: 'user-6',
    name: 'Aisha Patel',
    email: 'aisha.p@teamflow.io',
    role: 'member',
    title: 'Product Designer & Design Systems',
    avatarGradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    department: 'Product & Design',
    experienceYears: 5,
    bio: 'Crafting user-centric workflows, accessibility compliance (WCAG AAA), and interactive prototypes.',
    skills: [
      { name: 'UI/UX Design', level: 'Expert' },
      { name: 'Figma', level: 'Expert' },
      { name: 'CSS/Sass', level: 'Advanced' },
      { name: 'User Research', level: 'Expert' },
      { name: 'Design Systems', level: 'Expert' }
    ],
    availabilityHoursPerWeek: 40,
    currentWorkloadHours: 16,
    assignedProjectIds: ['proj-2']
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Apex AI Intelligence Engine',
    description: 'Real-time contextual copilot and automated team performance telemetry with low-latency LLM streaming.',
    category: 'AI / Platform',
    status: 'active',
    priority: 'urgent',
    startDate: '2026-08-15',
    deadline: '2026-10-30',
    requiredSkills: ['Python', 'Vector DBs', 'React', 'TypeScript', 'FastAPI'],
    leadId: 'user-admin',
    assignedMemberIds: ['user-admin', 'user-2', 'user-4'],
    progress: 68
  },
  {
    id: 'proj-2',
    title: 'NextGen Mobile Experience 2.0',
    description: 'Cross-platform mobile redesign focused on biometrics, buttery 120fps animations, and offline synchronization.',
    category: 'Mobile / Client',
    status: 'active',
    priority: 'high',
    startDate: '2026-09-01',
    deadline: '2026-11-20',
    requiredSkills: ['React', 'UI/UX Design', 'TypeScript', 'Design Systems'],
    leadId: 'user-2',
    assignedMemberIds: ['user-2', 'user-6'],
    progress: 42
  },
  {
    id: 'proj-3',
    title: 'Multi-Region Kubernetes Cloud Mesh',
    description: 'Autonomous cluster scaling, Istio service mesh routing, and zero-downtime blue-green release automated pipelines.',
    category: 'Cloud Infrastructure',
    status: 'active',
    priority: 'high',
    startDate: '2026-07-20',
    deadline: '2026-09-30',
    requiredSkills: ['Kubernetes', 'AWS', 'Docker', 'Terraform'],
    leadId: 'user-3',
    assignedMemberIds: ['user-admin', 'user-3'],
    progress: 85
  },
  {
    id: 'proj-4',
    title: 'Zero-Trust Identity & Compliance Core',
    description: 'Centralized FIDO2 WebAuthn authentication, audit log immutability, and automated SOC2 continuous compliance.',
    category: 'Security & Auth',
    status: 'planning',
    priority: 'medium',
    startDate: '2026-09-15',
    deadline: '2026-12-15',
    requiredSkills: ['OAuth / Auth0', 'Node.js', 'TypeScript', 'System Architecture'],
    leadId: 'user-admin',
    assignedMemberIds: ['user-5'],
    progress: 15
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    projectId: 'proj-1',
    title: 'Implement Vector Embeddings Cache',
    description: 'Setup Redis semantic cache for frequent query embeddings to lower GPU inference costs by 40%.',
    status: 'completed',
    priority: 'high',
    assignedToId: 'user-4',
    dueDate: '2026-09-02',
    estimatedHours: 8,
    tags: ['AI', 'Performance', 'Cache'],
    createdAt: '2026-08-28'
  },
  {
    id: 'task-102',
    projectId: 'proj-1',
    title: 'Streaming SSE Response Pipeline',
    description: 'Connect FastAPI SSE endpoints with frontend React hooks for typing typewriter visualization.',
    status: 'in_progress',
    priority: 'urgent',
    assignedToId: 'user-2',
    dueDate: '2026-09-08',
    estimatedHours: 12,
    tags: ['React', 'SSE', 'Streaming'],
    createdAt: '2026-09-01'
  },
  {
    id: 'task-103',
    projectId: 'proj-1',
    title: 'Token Usage & Rate Limiting Guardrails',
    description: 'Configure tenant-based sliding window rate limits with custom fallback policies.',
    status: 'in_review',
    priority: 'medium',
    assignedToId: 'user-4',
    dueDate: '2026-09-07',
    estimatedHours: 6,
    tags: ['Security', 'API'],
    createdAt: '2026-09-02'
  },
  {
    id: 'task-104',
    projectId: 'proj-1',
    title: 'Team Performance Heatmap Chart',
    description: 'Design and render D3/SVG canvas workload velocity metrics on the manager dashboard.',
    status: 'backlog',
    priority: 'medium',
    assignedToId: 'user-2',
    dueDate: '2026-09-14',
    estimatedHours: 10,
    tags: ['Frontend', 'Analytics'],
    createdAt: '2026-09-03'
  },
  {
    id: 'task-105',
    projectId: 'proj-2',
    title: 'Design System Token Unification',
    description: 'Audit light and dark color contrast tokens in Figma and export typed JSON variables.',
    status: 'completed',
    priority: 'high',
    assignedToId: 'user-6',
    dueDate: '2026-09-03',
    estimatedHours: 14,
    tags: ['Design', 'Tokens', 'UI/UX'],
    createdAt: '2026-08-29'
  },
  {
    id: 'task-106',
    projectId: 'proj-2',
    title: 'Micro-Interactions for Task Dragging',
    description: 'Add haptic-feeling spring physics animations when dragging cards across kanban columns.',
    status: 'in_progress',
    priority: 'medium',
    assignedToId: 'user-6',
    dueDate: '2026-09-10',
    estimatedHours: 8,
    tags: ['Animation', 'UI/UX'],
    createdAt: '2026-09-02'
  },
  {
    id: 'task-107',
    projectId: 'proj-3',
    title: 'Automate Canary Deployments in EKS',
    description: 'Implement Argo Rollouts with Prometheus automated canary analysis thresholds.',
    status: 'in_review',
    priority: 'urgent',
    assignedToId: 'user-3',
    dueDate: '2026-09-06',
    estimatedHours: 16,
    tags: ['DevOps', 'Kubernetes'],
    createdAt: '2026-08-30'
  },
  {
    id: 'task-108',
    projectId: 'proj-4',
    title: 'Implement WebAuthn Passkeys Handshake',
    description: 'Write browser client challenge verification endpoint with biometric authorization.',
    status: 'backlog',
    priority: 'high',
    assignedToId: 'user-5',
    dueDate: '2026-09-20',
    estimatedHours: 18,
    tags: ['Security', 'Passkeys'],
    createdAt: '2026-09-04'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'task_moved',
    title: 'Task Progress Updated',
    description: 'Sophia Chen moved "Streaming SSE Response Pipeline" to In Progress',
    timestamp: '15 minutes ago',
    actorName: 'Sophia Chen'
  },
  {
    id: 'act-2',
    type: 'member_assigned',
    title: 'Smart Team Formed',
    description: 'Alex Vance assigned Elena Rostova to Apex AI Intelligence Engine',
    timestamp: '1 hour ago',
    actorName: 'Alex Vance'
  },
  {
    id: 'act-3',
    type: 'task_moved',
    title: 'Canary Deployments In Review',
    description: 'Marcus Brody submitted "Automate Canary Deployments in EKS" for code review',
    timestamp: '3 hours ago',
    actorName: 'Marcus Brody'
  },
  {
    id: 'act-4',
    type: 'project_created',
    title: 'New Project Initialized',
    description: 'Alex Vance created project "Zero-Trust Identity & Compliance Core"',
    timestamp: '1 day ago',
    actorName: 'Alex Vance'
  }
];

/**
 * Intelligent Match Algorithm:
 * Evaluates candidates against project requirements based on:
 * 1. Skill overlap & proficiency (Expert = 100%, Advanced = 80%, Intermediate = 60%, Beginner = 40%)
 * 2. Workload capacity (Availability vs Current Workload)
 * 3. Relevant experience weighting
 */
export function calculateSmartMatches(project: Project, candidates: User[]): SmartMatchResult[] {
  const reqSkills = project.requiredSkills.map(s => s.toLowerCase());

  return candidates.map(member => {
    const memberSkillMap = new Map(
      member.skills.map(s => [s.name.toLowerCase(), s.level])
    );

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];
    let skillScoreTotal = 0;

    project.requiredSkills.forEach(req => {
      const lower = req.toLowerCase();
      if (memberSkillMap.has(lower)) {
        matchingSkills.push(req);
        const level = memberSkillMap.get(lower)!;
        const weights: Record<string, number> = {
          Expert: 1.0,
          Advanced: 0.85,
          Intermediate: 0.65,
          Beginner: 0.4
        };
        skillScoreTotal += weights[level] || 0.5;
      } else {
        missingSkills.push(req);
      }
    });

    const skillMatchRatio = reqSkills.length > 0 ? (skillScoreTotal / reqSkills.length) : 0;

    // Capacity ratio (0 to 1)
    const remainingHours = Math.max(0, member.availabilityHoursPerWeek - member.currentWorkloadHours);
    const capacityRatio = Math.min(1, remainingHours / 20); // 20 free hours considered optimal capacity

    let workloadStatus: 'available' | 'optimal' | 'overloaded' = 'available';
    if (member.currentWorkloadHours >= member.availabilityHoursPerWeek * 0.9) {
      workloadStatus = 'overloaded';
    } else if (member.currentWorkloadHours >= member.availabilityHoursPerWeek * 0.6) {
      workloadStatus = 'optimal';
    }

    // Weighting: 70% skills match, 20% capacity, 10% experience
    const expBonus = Math.min(1, member.experienceYears / 10);
    const totalScore = Math.round((skillMatchRatio * 0.7 + capacityRatio * 0.2 + expBonus * 0.1) * 100);

    let fitSummary = '';
    if (totalScore >= 80) {
      fitSummary = `Prime fit! Covers ${matchingSkills.length}/${project.requiredSkills.length} core competencies with ${remainingHours}h available capacity.`;
    } else if (totalScore >= 50) {
      fitSummary = `Moderate fit. Brings strong ${matchingSkills.slice(0, 2).join(', ')} capabilities.`;
    } else {
      fitSummary = `Partial match. Needs supplemental coverage for ${missingSkills.slice(0, 2).join(', ')}.`;
    }

    return {
      member,
      matchScore: Math.min(99, Math.max(15, totalScore)),
      matchingSkills,
      missingSkills,
      workloadStatus,
      fitSummary
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
