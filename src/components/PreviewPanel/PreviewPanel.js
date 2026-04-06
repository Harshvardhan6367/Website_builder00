// [file name]: PreviewPanel.js
// [file content begin]
// src/components/PreviewPanel/PreviewPanel.js
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { FiMaximize, FiMinimize, FiDownload, FiCopy, FiRefreshCw, FiEdit, FiSave, FiX, FiEdit3 } from 'react-icons/fi';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import './PreviewPanel.css';

const PreviewPanel = ({ project, onAgentOpen }) => {
  const [viewMode, setViewMode] = useState('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('html');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedCode, setEditedCode] = useState({
    html: '',
    css: '',
    js: ''
  });
  const [isRefactoring, setIsRefactoring] = useState(false);

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Navigation guard script - optimized with better event handling
  const NAV_GUARD_SCRIPT = useMemo(() => `
    <script>
      (function() {
        const blockNavigation = (e) => {
          // Only block non-safe URLs
          const link = e.target.closest('a');
          if (link) {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const isHash = href.startsWith('#');
            const isJS = href.startsWith('javascript:');
            const isMailTo = href.startsWith('mailto:');
            const isTel = href.startsWith('tel:');
            
            if (isHash || isJS || isMailTo || isTel) {
              return; // Allow these
            }
            
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        };

        const blockFormSubmit = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
        };

        // Use capturing phase for better control
        document.addEventListener('click', blockNavigation, true);
        document.addEventListener('submit', blockFormSubmit, true);
        
        // Cleanup function for when iframe is removed
        window.__cleanupPreview = () => {
          document.removeEventListener('click', blockNavigation, true);
          document.removeEventListener('submit', blockFormSubmit, true);
        };
      })();
    </script>
  `, []);

  // Reset edited code when project changes
  useEffect(() => {
    setEditedCode({
      html: project.html || '',
      css: project.css || '',
      js: project.js || ''
    });
    
    // Force refresh when project changes (including AI agent updates)
    setRefreshKey(prev => prev + 1);
  }, [project.id, project.html, project.css, project.js]);

  // Listen for project updates (for AI Agent changes)
  useEffect(() => {
    // Force preview refresh when project code changes
    setRefreshKey(prev => prev + 1);
    
    // Clean up iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.__cleanupPreview?.();
      } catch (e) {
        // Cross-origin error, ignore
      }
    }
  }, [project.html, project.css, project.js]);

  // Memoize srcDoc to avoid recomputation on every render
  const srcDoc = useMemo(() => {
    let html = editedCode.html || '';
    const css = editedCode.css || '';
    const js = editedCode.js || '';

    if (!html.trim()) return '';

    // Inject CSS
    if (css) {
      if (/<\/head>/i.test(html)) {
        html = html.replace(/<\/head>/i, `<style>${css}</style>$&`);
      } else {
        html = `<style>${css}</style>${html}`;
      }
    }

    // Inject JS and guard
    const scripts = [];
    if (js) {
      scripts.push(`<script>try{${js}}catch(e){console.error('Preview JS Error:', e)}<\/script>`);
    }
    scripts.push(NAV_GUARD_SCRIPT);

    if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, `${scripts.join('')}$&`);
    } else {
      html += scripts.join('');
    }

    return html;
  }, [editedCode.html, editedCode.css, editedCode.js, refreshKey]);

  // Handle fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleFullscreen = useCallback(() => {
    const elem = viewMode === 'preview' ? iframeRef.current : containerRef.current;

    if (!elem) return;

    if (!isFullscreen) {
      const requestFs = elem.requestFullscreen ||
        elem.webkitRequestFullscreen ||
        elem.mozRequestFullScreen ||
        elem.msRequestFullscreen;

      if (requestFs) {
        requestFs.call(elem).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      const exitFs = document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;

      if (exitFs) {
        exitFs.call(document);
      }
    }
  }, [isFullscreen, viewMode]);

  const handleDownload = useCallback(async () => {
    try {
      const zip = new JSZip();
      const nameSlug = project.name.toLowerCase().replace(/\s+/g, '-');

      let htmlContent = editedCode.html || '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body></body></html>';

      // Ensure proper HTML structure
      if (!/<html/i.test(htmlContent)) {
        htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${htmlContent}</body></html>`;
      }

      // Inject external resources
      if (/<\/head>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<\/head>/i, '<link rel="stylesheet" href="styles.css">\n$&');
      } else if (/<body/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<body/i, '<link rel="stylesheet" href="styles.css">\n$&');
      }

      if (/<\/body>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<\/body>/i, '<script src="script.js"></script>\n$&');
      } else {
        htmlContent += '\n<script src="script.js"></script>';
      }

      zip.file("index.html", htmlContent);
      zip.file("styles.css", editedCode.css || '');
      zip.file("script.js", editedCode.js || '');
      zip.file("README.md", `# ${project.name}\n\n${project.description || 'No description provided.'}\n\nGenerated by AI Website Builder`);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${nameSlug}.zip`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download project. Please try again.');
    }
  }, [project, editedCode]);

  const handleCopyCode = useCallback(() => {
    let code = '';
    switch (activeTab) {
      case 'html': code = editedCode.html || ''; break;
      case 'css': code = editedCode.css || ''; break;
      case 'js': code = editedCode.js || ''; break;
      default: code = '';
    }

    navigator.clipboard.writeText(code).then(() => {
      // Optional: Show a success toast/notification
      console.log('Code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }, [activeTab, editedCode]);

  const handleRefreshPreview = useCallback(() => {
    // Force iframe refresh by updating key
    setRefreshKey(prev => prev + 1);

    // Clean up previous iframe scripts
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.__cleanupPreview?.();
      } catch (e) {
        // Cross-origin error, ignore
      }
    }
  }, []);

  const getTabContent = useCallback(() => {
    switch (activeTab) {
      case 'html': return editedCode.html || '';
      case 'css': return editedCode.css || '';
      case 'js': return editedCode.js || '';
      default: return '';
    }
  }, [activeTab, editedCode]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = () => {
    // Update the project with edited code
    // You would typically call an update function here
    console.log('Saved code:', editedCode);
    setEditMode(false);
    // Optionally update project here
  };

  const handleCancelClick = () => {
    // Revert to original code
    setEditedCode({
      html: project.html || '',
      css: project.css || '',
      js: project.js || ''
    });
    setEditMode(false);
  };

  const handleCodeChange = (newCode) => {
    setEditedCode(prev => ({
      ...prev,
      [activeTab]: newCode
    }));
  };

  const handleAIRefactor = async () => {
    if (!editedCode[activeTab]?.trim()) {
      alert('No code to refactor!');
      return;
    }

    setIsRefactoring(true);

    try {
      // Create a temporary project with current code
      const tempProject = {
        ...project,
        description: `Refactor and improve this ${activeTab.toUpperCase()} code: ${editedCode[activeTab].substring(0, 200)}...`,
        html: activeTab === 'html' ? editedCode.html : '',
        css: activeTab === 'css' ? editedCode.css : '',
        js: activeTab === 'js' ? editedCode.js : ''
      };

      // Use the AI context to refactor the code
      // This is a simplified version - you might want to create a separate refactor function
      alert('AI Refactor feature requires implementation in AIContext.js');

    } catch (error) {
      console.error('Refactor failed:', error);
      alert('Failed to refactor code: ' + error.message);
    } finally {
      setIsRefactoring(false);
    }
  };

  // View mode class calculation
  const viewModeClass = `view-mode-${viewMode}`;
  const panelClass = `preview-panel ${isFullscreen ? 'fullscreen' : ''} ${viewModeClass}`;

  return (
    <div ref={containerRef} className={panelClass}>
      <div className="preview-header">
        <div className="header-left">
          <h2>{project.name}</h2>
          <span className="project-status">
            <span className={`status-dot ${project.status === 'generating' ? 'pulsing' : ''}`}></span>
            {project.status === 'generating' ? 'Generating...' : project.status || 'Ready'}
            {editMode && <span style={{ marginLeft: '10px', color: 'var(--accent)' }}> • Editing</span>}
          </span>
        </div>

        <div className="header-right">
          <div className="view-controls">
            {['code', 'split', 'preview'].map((mode) => (
              <button
                key={mode}
                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <div className="action-buttons">
            {/* AI Agent Button */}
            <button
              className="action-btn agent-btn"
              onClick={onAgentOpen}
              title="AI Agent - Modify with prompts"
            >
              <FiEdit3 />
            </button>

            <button
              className="action-btn"
              onClick={handleRefreshPreview}
              title="Refresh Preview"
              disabled={project.status === 'generating'}
            >
              <FiRefreshCw />
            </button>
            <button
              className="action-btn"
              onClick={handleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </button>
            <button
              className="action-btn"
              onClick={handleCopyCode}
              title="Copy Code"
            >
              <FiCopy />
            </button>
            <button
              className="action-btn download-btn"
              onClick={handleDownload}
              title="Download Project"
            >
              <FiDownload />
            </button>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Code Section */}
        <div className="code-section">
          <div className="code-tabs">
            {['html', 'css', 'js'].map((tab) => (
              <div key={tab} className="code-tab-wrapper">
                <button
                  className={`code-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
                {activeTab === tab && !editMode && (
                  <button
                    className="edit-tab-btn"
                    onClick={handleEditClick}
                    title="Edit Code"
                  >
                    <FiEdit />
                  </button>
                )}
              </div>
            ))}

            {editMode && (
              <div className="edit-controls">
                <button
                  className="edit-btn save-btn"
                  onClick={handleSaveClick}
                  title="Save Changes"
                >
                  <FiSave />
                </button>
                <button
                  className="edit-btn cancel-btn"
                  onClick={handleCancelClick}
                  title="Cancel"
                >
                  <FiX />
                </button>
                <button
                  className="edit-btn ai-refactor-btn"
                  onClick={handleAIRefactor}
                  title="AI Refactor"
                  disabled={isRefactoring}
                >
                  {isRefactoring ? 'Refactoring...' : 'AI Refactor'}
                </button>
              </div>
            )}
          </div>

          <div className="code-editor-wrapper">
            <CodeEditor
              language={activeTab}
              value={getTabContent()}
              onChange={editMode ? handleCodeChange : undefined}
              readOnly={!editMode}
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="preview-section">
          <iframe
            key={`${refreshKey}-${project.updatedAt}`}
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Website Preview"
            className="preview-frame"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
            allow="fullscreen"
            loading="lazy"
          />
          {!srcDoc && (
            <div className="empty-preview">
              <p>No preview available. Add HTML content to see the preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
// [file content end]