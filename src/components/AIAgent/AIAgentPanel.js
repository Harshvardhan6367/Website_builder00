// src/components/AIAgent/AIAgentPanel.js
import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { useProject } from '../../context/ProjectContext';
import { FiX, FiSend, FiCpu, FiRotateCcw, FiClock, FiCode, FiUser } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import './AIAgentPanel.css';

const AIAgentPanel = ({ isOpen, onClose, project }) => {
    const { modifyWebsiteWithPrompt, isGenerating: isGlobalGenerating } = useAI();
    const { updateProject } = useProject();
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState([]);
    const [currentThought, setCurrentThought] = useState(null);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of history
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, currentThought]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!input.trim() || isProcessing) return;

        const userPrompt = input;
        setInput('');
        setIsProcessing(true);

        // Add user message to history
        const newMessage = {
            id: Date.now(),
            type: 'user',
            content: userPrompt,
            timestamp: new Date().toISOString()
        };
        setHistory(prev => [...prev, newMessage]);

        try {
            setCurrentThought({
                step: 'Analyzing request...',
                details: 'Understanding what needs to be changed in the current codebase.'
            });

            const result = await modifyWebsiteWithPrompt(project, userPrompt);

            setCurrentThought({
                step: 'Applying changes...',
                details: 'Updating HTML, CSS, and JavaScript files.'
            });

            // Update project with new code - force a complete update
            updateProject(project.id, {
                html: result.html,
                css: result.css,
                js: result.js,
                updatedAt: new Date().toISOString()  // Force update timestamp
            });

            // Add AI response to history
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                thought: result.thought,
                changes: result.changes,
                originalState: result.originalState,
                timestamp: new Date().toISOString()
            };
            setHistory(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error('AI Agent Error:', error);
            setHistory(prev => [...prev, {
                id: Date.now() + 2,
                type: 'error',
                content: error.message || 'Failed to process request',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsProcessing(false);
            setCurrentThought(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleRevert = (originalState) => {
        if (window.confirm('Are you sure you want to revert these changes?')) {
            updateProject(project.id, {
                html: originalState.html,
                css: originalState.css,
                js: originalState.js,
                updatedAt: new Date().toISOString()
            });

            setHistory(prev => [...prev, {
                id: Date.now(),
                type: 'system',
                content: 'Reverted changes to previous state.',
                timestamp: new Date().toISOString()
            }]);
        }
    };



    return (
        <div className="ai-agent-overlay">
            <div className="ai-agent-panel">
                <div className="agent-header">
                    <div className="agent-title">
                        <RiRobot2Line className="agent-icon" />
                        <div>
                            <h3>AI Agent</h3>
                            <p className="agent-subtitle">Modifying "{project.name}"</p>
                        </div>
                    </div>
                    <button className="close-agent" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {/* Thought Process Display */}
                {currentThought && (
                    <div className="thought-process">
                        <div className="thinking">
                            <div className="thinking-header">
                                <FiCpu className="thinking-icon" />
                                <span>AI is thinking...</span>
                            </div>
                            <div className="thinking-content">
                                <div className="thought-step">
                                    <span className="thought-dot"></span>
                                    <span>{currentThought.step}</span>
                                </div>
                                <div className="thought-step" style={{ opacity: 0.7 }}>
                                    <span className="thought-dot" style={{ background: 'transparent', border: '1px solid currentColor' }}></span>
                                    <span>{currentThought.details}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat History */}
                <div className="edit-history" ref={scrollRef}>
                    {history.length === 0 ? (
                        <div className="empty-history">
                            <RiRobot2Line size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>I can help you modify this website. Tell me what to change!</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((item) => (
                                <div key={item.id} className={`history-item ${item.type}`}>
                                    <div className="history-item-header">
                                        <div className="history-type">
                                            {item.type === 'user' && (
                                                <>
                                                    <div className="user-avatar">U</div>
                                                    <span className="type-label">You</span>
                                                </>
                                            )}
                                            {item.type === 'ai' && (
                                                <>
                                                    <RiRobot2Line className="ai-icon" />
                                                    <span className="type-label">Agent</span>
                                                </>
                                            )}
                                            {item.type === 'error' && (
                                                <>
                                                    <div className="error-icon">!</div>
                                                    <span className="type-label">Error</span>
                                                </>
                                            )}
                                            {item.type === 'system' && (
                                                <>
                                                    <FiCode className="system-icon" />
                                                    <span className="type-label">System</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="history-time">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <div className="history-content">
                                        {item.type === 'user' && <p>{item.content}</p>}

                                        {item.type === 'ai' && (
                                            <>
                                                <p>{item.thought}</p>
                                                {item.changes && item.changes.length > 0 && (
                                                    <div className="changes-summary">
                                                        <strong>Changes made:</strong>
                                                        <ul>
                                                            {item.changes.map((change, idx) => (
                                                                <li key={idx}>{change}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {item.originalState && (
                                                    <button
                                                        className="revert-btn"
                                                        onClick={() => handleRevert(item.originalState)}
                                                    >
                                                        <FiRotateCcw /> Revert this change
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {item.type === 'error' && <p>{item.content}</p>}
                                        {item.type === 'system' && <p>{item.content}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Prompts */}


                {/* Input Area */}
                <div className="agent-input-area">
                    <div className="input-wrapper">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe how you want to modify the website..."
                            disabled={isProcessing}
                            rows={1}
                        />
                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={!input.trim() || isProcessing}
                        >
                            {isProcessing ? <div className="spinner"></div> : <FiSend />}
                        </button>
                    </div>
                    <div className="input-hint">
                        <FiClock /> Changes are applied immediately to the preview
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAgentPanel;