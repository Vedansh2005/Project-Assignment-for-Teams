import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { 
  Users, 
  Award, 
  Briefcase, 
  Clock, 
  Edit3, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';

export const TeamRosterView: React.FC<{ onOpenEditSkills: (user: User) => void }> = ({
  onOpenEditSkills
}) => {
  const { users, projects, currentUser } = useApp();
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const departments = Array.from(new Set(users.map(u => u.department)));

  const filteredUsers = users.filter(u => {
    if (filterDepartment !== 'all' && u.department !== filterDepartment) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={22} color="var(--text-accent)" />
            Engineering Roster & Skill Matrix ({filteredUsers.length})
          </h2>
          <p style={{ fontSize: '0.85rem' }}>Full visibility into developer skill competencies, workload capacities, and active assignments</p>
        </div>

        <div>
          <select
            className="form-control"
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            style={{ width: 'auto', fontSize: '0.85rem' }}
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.35rem' }}>
        {filteredUsers.map(member => {
          const assignedProjects = projects.filter(p => member.assignedProjectIds.includes(p.id));
          const freeHours = Math.max(0, member.availabilityHoursPerWeek - member.currentWorkloadHours);
          const isCurrentUser = member.id === currentUser.id;

          return (
            <div
              key={member.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderTop: isCurrentUser ? '3px solid var(--text-accent)' : '1px solid var(--border-card)'
              }}
            >
              {/* Header: Avatar, Name & Edit Skills button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <div
                    className="avatar avatar-lg"
                    style={{ background: member.avatarGradient }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{member.name}</h3>
                      {isCurrentUser && (
                        <span className="badge badge-skill" style={{ fontSize: '0.65rem' }}>You</span>
                      )}
                      {member.role === 'admin' && (
                        <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>Admin</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{member.title}</p>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{member.department}</span>
                  </div>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onOpenEditSkills(member)}
                  title="Edit Skills & Bio"
                  style={{ padding: '0.35rem 0.55rem' }}
                >
                  <Edit3 size={15} />
                </button>
              </div>

              {/* Bio */}
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {member.bio}
              </p>

              {/* Workload Capacity Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Workload Allocation</span>
                  <span style={{ fontWeight: 600 }}>
                    {member.currentWorkloadHours}h / {member.availabilityHoursPerWeek}h ({freeHours}h free)
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${(member.currentWorkloadHours / member.availabilityHoursPerWeek) * 100}%`,
                      background: member.currentWorkloadHours >= 36 ? 'var(--gradient-danger)' : 'var(--gradient-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Verified Technical Skills */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Technical Competencies:
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-accent)' }}>
                    {member.skills.length} Skills
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {member.skills.map(s => (
                    <span key={s.name} className="badge badge-skill" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {s.name}
                      <span className="badge-skill-level">{s.level}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Assigned Projects */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Current Deployments:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.3rem' }}>
                  {assignedProjects.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Available for assignment
                    </span>
                  ) : (
                    assignedProjects.map(p => (
                      <span key={p.id} className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
                        <Briefcase size={11} /> {p.title}
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
