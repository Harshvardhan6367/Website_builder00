// [file name]: Sidebar.js
// [file content begin]
// src/components/Sidebar/Sidebar.js
import React from 'react';
import { FiPlus, FiFolder, FiGrid, FiSettings, FiZap, FiGlobe, FiEdit3 } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange, onSettingsClick, onAgentClick }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <RiRobot2Line className="logo-icon" />
          <span className="logo-text">AgenticAI</span>
          <span className="logo-badge">BETA</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'new-project' ? 'active' : ''}`}
          onClick={() => onTabChange('new-project')}
        >
          <FiPlus className="nav-icon" />
          <span>New Project</span>
        </button>
        
        <div className="nav-section">
          <h3 className="nav-section-title">Workspace</h3>
          <button 
            className={`nav-item ${activeTab === 'recent-projects' ? 'active' : ''}`}
            onClick={() => onTabChange('recent-projects')}
          >
            <FiFolder className="nav-icon" />
            <span>Recent Projects</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => onTabChange('templates')}
          >
            <FiGrid className="nav-icon" />
            <span>Templates</span>
          </button>
        </div>
        
        <div className="nav-section">
          <h3 className="nav-section-title">AI Tools</h3>
          <button className="nav-item">
            <FiZap className="nav-icon" />
            <span>Quick Generate</span>
            <span className="nav-badge">NEW</span>
          </button>
          
          <button className="nav-item">
            <FiGlobe className="nav-icon" />
            <span>Web Search</span>
          </button>

          {/* AI Agent Button - Only enabled when viewing a project */}
          <button 
            className="nav-item"
            onClick={onAgentClick}
            title="AI Agent - Modify website with prompts"
          >
            <FiEdit3 className="nav-icon" />
            <span>AI Agent</span>
            <span className="nav-badge">AGENT</span>
          </button>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <button 
          className="nav-item settings-btn"
          onClick={onSettingsClick}
        >
          <FiSettings className="nav-icon" />
          <span>Settings</span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <RiRobot2Line />
          </div>
          <div className="user-info">
            <span className="username">AI Assistant</span>
            <span className="user-status">Agent Mode</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
// [file content end]