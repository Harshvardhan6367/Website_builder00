// src/components/SettingsPanel/SettingsPanel.js
import React, { useState } from 'react';
import { useAI } from '../../context/AIContext';
import { FiKey, FiMoon, FiSun, FiSave, FiX } from 'react-icons/fi';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useAI();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [theme, setTheme] = useState('dark');
  const [autoSave, setAutoSave] = useState(true);
  const [codeTheme, setCodeTheme] = useState('tomorrow');
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    // Save API key separately
    localStorage.setItem('ai-builder-api-key', localApiKey);
    setApiKey(localApiKey);
    
    // Save other settings to localStorage
    localStorage.setItem('ai-builder-settings', JSON.stringify({
        theme,
        autoSave,
        codeTheme,
        notifications,
    }));
    onClose();
  };

  const handleReset = () => {
    setLocalApiKey('');
    setTheme('dark');
    setAutoSave(true);
    setCodeTheme('tomorrow');
    setNotifications(true);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>
              <FiKey /> API Configuration
            </h3>
            <div className="api-input-group">
              <label htmlFor="apiKey">Google Gemini API Key</label>
              <input
                id="apiKey"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="api-input"
              />
              <p className="api-hint">
                Get your API key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h3>
              <FiMoon /> Appearance
            </h3>
            <div className="theme-options">
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.value)}
                />
                <div className="theme-preview dark-theme">
                  <FiMoon />
                  <span>Dark</span>
                </div>
              </label>

              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={(e) => setTheme(e.target.value)}
                />
                <div className="theme-preview light-theme">
                  <FiSun />
                  <span>Light</span>
                </div>
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <span>Auto-save projects</span>
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span>Enable notifications</span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Code Editor</h3>
            <div className="setting-item">
              <label>Code Theme</label>
              <select
                value={codeTheme}
                onChange={(e) => setCodeTheme(e.target.value)}
                className="theme-select"
              >
                <option value="tomorrow">Tomorrow Dark</option>
                <option value="dracula">Dracula</option>
                <option value="monokai">Monokai</option>
                <option value="github">GitHub</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Export Settings</h3>
            <div className="setting-item">
              <label>Default Format</label>
              <select className="format-select">
                <option value="zip">ZIP Archive</option>
                <option value="github">GitHub Repository</option>
                <option value="netlify">Netlify Deploy</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="reset-btn" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="save-btn" onClick={handleSave}>
            <FiSave /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;