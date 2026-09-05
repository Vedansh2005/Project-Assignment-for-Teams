import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Users, 
  FolderKanban, 
  Briefcase, 
  LayoutDashboard, 
  Plus, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewProject,
  onOpenNewTask
}) => {
  const { currentUser, users, setCurrentUser, theme, toggleTheme, resetToDefaults } = useApp();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem' }}>
        
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div 
            onClick={() => setActiveTab('overview')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>TeamFlow</h2>
                <span className="badge badge-skill" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>PAFT 2.0</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Smart Project & Team Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={16} />
              Overview
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'matcher' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('matcher')}
            >
              <Sparkles size={16} />
              Smart Matcher
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('kanban')}
            >
              <FolderKanban size={16} />
              Kanban Board
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'projects' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('projects')}
            >
              <Briefcase size={16} />
              Projects
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'team' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('team')}
            >
              <Users size={16} />
              Team Roster
            </button>
          </nav>
        </div>

        {/* Right Actions: Switcher, Theme, Quick Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Quick Add Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm btn-secondary" onClick={onOpenNewTask}>
              <Plus size={15} />
              New Task
            </button>
            {currentUser.role === 'admin' && (
              <button className="btn btn-sm btn-primary" onClick={onOpenNewProject}>
                <Plus size={15} />
                New Project
              </button>
            )}
          </div>

          {/* Perspective / Role Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-input)',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-card)'
          }}>
            <div 
              className="avatar avatar-sm" 
              style={{ background: currentUser.avatarGradient }}
            >
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const target = users.find(u => u.id === e.target.value);
                  if (target) setCurrentUser(target);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id} style={{ background: 'var(--bg-card-solid)', color: 'var(--text-primary)' }}>
                    {u.name} ({u.role === 'admin' ? 'Admin' : u.title.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Toggle */}
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* Reset Demo Data */}
          <button
            className="btn btn-sm btn-ghost"
            onClick={resetToDefaults}
            title="Reset to initial showcase state"
            style={{ padding: '0.5rem', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={16} />
          </button>

        </div>
      </div>
    </header>
  );
};
