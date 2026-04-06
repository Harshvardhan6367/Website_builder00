// src/components/CodeEditor/CodeEditor.js
import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
import './CodeEditor.css';

const CodeEditor = ({ language, value, onChange, readOnly = false }) => {
  const [code, setCode] = useState(value);
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setCode(value);
  }, [value]);

  const handleChange = (newCode) => {
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  const getLanguageHighlight = () => {
    switch (language) {
      case 'html': return languages.markup;
      case 'css': return languages.css;
      case 'js': return languages.js;
      default: return languages.js;
    }
  };

  // Fix for cursor position - handle editor focus
  const handleEditorClick = () => {
    if (editorRef.current) {
      // Focus the textarea inside the editor
      const textarea = editorRef.current.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  };

  return (
    <div
      className="code-editor-container"
      ref={containerRef}
      onClick={handleEditorClick}
      style={{ overflow: 'auto', cursor: 'text' }}
    >
      <div ref={editorRef}>
        <Editor
          value={code}
          onValueChange={handleChange}
          highlight={code => highlight(code, getLanguageHighlight())}
          padding={15}
          className="code-editor"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", "JetBrains Mono", monospace',
            fontSize: 14,
            lineHeight: '1.5',
            backgroundColor: '#1a1b26',
            color: '#c0caf5',
            minHeight: '100%',
            borderRadius: '8px',
            fontVariantLigatures: 'none',
          }}
          textareaClassName="code-editor-textarea"
          preClassName="code-editor-pre"
          readOnly={readOnly}
          ignoreTabKey={false}
          autoFocus={false}
        />
      </div>
    </div>
  );
};

export default CodeEditor;