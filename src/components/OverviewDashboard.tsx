import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface OverviewDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  setActiveTab,
  onOpenNewProject,
  onOpenNewTask
}) => {
  const { currentUser, projects, tasks, users, activities } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const totalWorkload = users.reduce((acc, u) => acc + u.currentWorkloadHours, 0);
  const totalCapacity = users.reduce((acc, u) => acc + u.availabilityHoursPerWeek, 0);
  const utilizationRate = Math.round((totalWorkload / totalCapacity) * 100);

  const myAssignedTasks = tasks.filter(t => t.assignedToId === currentUser.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Hero Welcome Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <span className="badge badge-skill">
              <ShieldCheck size={14} /> {currentUser.role === 'admin' ? 'Engineering Command View' : 'Contributor Workspace'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome back, {currentUser.name}</span>
          </div>

          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.6rem', background: 'linear-gradient(135deg, #fff 40%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Autonomous Team Formation & Project Delivery
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Supercharge team allocation with algorithmic skill matching, real-time Kanban execution, and workload balancing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('matcher')}>
            <Sparkles size={16} />
            Smart Matcher
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('kanban')}>
            <CheckSquare size={16} />
            View Kanban Board
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.2rem',
            height: '3.2rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Projects</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{projects.length}</div>
            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Across 4 Core Disciplines</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.2rem',
            height: '3.2rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tasks Completed</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{completedTasks} / {totalTasks}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inProgressTasks} Currently In Flight</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.2rem',
            height: '3.2rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Team Utilization</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{utilizationRate}%</div>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>{totalCapacity - totalWorkload}h Free Buffer</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.2rem',
            height: '3.2rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Roster Engineers</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{users.length}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)' }}>100% Skill Indexed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        
        {/* Active Projects Showcase */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} color="var(--text-accent)" />
              Active Projects & Progress
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('projects')}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {projects.map(proj => {
              const assignedUsers = users.filter(u => proj.assignedMemberIds.includes(u.id));

              return (
                <div 
                  key={proj.id}
                  style={{
                    background: 'var(--bg-card-solid)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{proj.title}</h4>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{proj.category} • Due {proj.deadline}</span>
                    </div>
                    <span className={`badge badge-${proj.priority}`}>{proj.priority}</span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Completion Velocity</span>
                      <span style={{ fontWeight: 600 }}>{proj.progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>

                  {/* Team Avatars & Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {assignedUsers.map((u, i) => (
                        <div
                          key={u.id}
                          className="avatar avatar-sm"
                          style={{
                            background: u.avatarGradient,
                            marginLeft: i === 0 ? 0 : '-0.5rem',
                            zIndex: 10 - i
                          }}
                          title={u.name}
                        >
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                        {assignedUsers.length} assigned
                      </span>
                    </div>

                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setActiveTab('matcher')}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Sparkles size={13} /> Optimize Team
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Personal Tasks & Live Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* My Current Assigned Tasks */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={18} color="#10b981" />
                My Priority Tasks ({currentUser.name.split(' ')[0]})
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('kanban')}>
                Board <ArrowRight size={14} />
              </button>
            </div>

            {myAssignedTasks.length === 0 ? (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>
                No active tasks assigned directly to your profile. Check the Kanban board to pick up backlog items!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {myAssignedTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    style={{
                      background: 'var(--bg-card-solid)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{task.title}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due {task.dueDate} • {task.estimatedHours}h estimate</span>
                    </div>
                    <span className={`badge badge-${task.priority}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--text-muted)" />
              Real-time System Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activities.slice(0, 4).map(act => (
                <div key={act.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    marginTop: '0.45rem',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{act.title}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{act.description}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
