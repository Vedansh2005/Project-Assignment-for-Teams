import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Briefcase, 
  Calendar, 
  Users, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const ProjectsView: React.FC<{ onOpenNewProject: () => void; onGoToMatcher: () => void }> = ({
  onOpenNewProject,
  onGoToMatcher
}) => {
  const { projects, users, currentUser, deleteProject } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(projects.map(p => p.category)));

  const filteredProjects = projects.filter(p => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Filter */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Briefcase size={22} color="var(--text-accent)" />
            Engineering Projects ({filteredProjects.length})
          </h2>
          <p style={{ fontSize: '0.85rem' }}>Track cross-functional milestones, technical competencies, and team allocations</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ width: 'auto', fontSize: '0.85rem' }}
          >
            <option value="all">All Disciplines</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {currentUser.role === 'admin' && (
            <button className="btn btn-primary" onClick={onOpenNewProject}>
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.35rem' }}>
        {filteredProjects.map(project => {
          const assignedMembers = users.filter(u => project.assignedMemberIds.includes(u.id));

          return (
            <div
              key={project.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem',
                position: 'relative'
              }}
            >
              {/* Card Header: Category & Priority */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-skill" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {project.category}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className={`badge badge-${project.priority}`}>
                    {project.priority}
                  </span>
                  {currentUser.role === 'admin' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteProject(project.id)}
                      title="Delete project"
                      style={{ padding: '0.2rem 0.35rem', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>{project.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {project.description}
                </p>
              </div>

              {/* Required Skills Chips */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Required Skills:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.3rem' }}>
                  {project.requiredSkills.map(skill => (
                    <span key={skill} className="badge badge-skill" style={{ fontSize: '0.72rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Velocity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress Velocity</span>
                  <span style={{ fontWeight: 700 }}>{project.progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Deadline & Assigned Roster */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  <span>Due {project.deadline}</span>
                </div>

                {/* Team Avatars */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {assignedMembers.slice(0, 4).map((member, i) => (
                    <div
                      key={member.id}
                      className="avatar avatar-sm"
                      style={{
                        background: member.avatarGradient,
                        marginLeft: i === 0 ? 0 : '-0.5rem',
                        zIndex: 10 - i,
                        width: '1.9rem',
                        height: '1.9rem'
                      }}
                      title={member.name}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  ))}
                  {assignedMembers.length > 4 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                      +{assignedMembers.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Action: Open in Matcher */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={onGoToMatcher}
                style={{ width: '100%', marginTop: '0.2rem' }}
              >
                <Sparkles size={14} /> Smart Match & Assign Team
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
