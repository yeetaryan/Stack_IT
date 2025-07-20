import React, { useState, useRef } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import './RichTextEditor.css';

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  height = "250px",
  className = ""
}) => {
  const editorRef = useRef(null);
  const [showCodeSection, setShowCodeSection] = useState(false);
  const [codeContent, setCodeContent] = useState('');

  const execCommand = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateValue();
  };

  const updateValue = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleInput = () => {
    updateValue();
  };

  const insertCodeSection = () => {
    if (showCodeSection) {
      // Insert code content at a new line
      const codeHTML = `<br><div class="code-section"><pre><code>${codeContent}</code></pre></div><br>`;
      execCommand('insertHTML', codeHTML);
      setShowCodeSection(false);
      setCodeContent('');
    } else {
      setShowCodeSection(true);
    }
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`toolbar-button p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-gray-200 text-black' : 'text-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={`rich-text-editor border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="toolbar bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <div className="flex gap-1">
          <ToolbarButton
            icon={BoldIcon}
            onClick={() => execCommand('bold')}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            icon={ItalicIcon}
            onClick={() => execCommand('italic')}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            icon={UnderlineIcon}
            onClick={() => execCommand('underline')}
            title="Underline (Ctrl+U)"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <div className="flex gap-1">
          <ToolbarButton
            icon={CodeBracketIcon}
            onClick={insertCodeSection}
            title="Insert Code Section"
            active={showCodeSection}
          />
        </div>
      </div>

      {/* Code Section Input */}
      {showCodeSection && (
        <div className="code-input-section bg-gray-100 border-b border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Code Section</span>
            <button
              onClick={() => setShowCodeSection(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-32 p-2 border border-gray-300 rounded text-sm font-mono bg-white resize-none"
            style={{ direction: 'ltr', textAlign: 'left' }}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={insertCodeSection}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Insert Code
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{ 
          height,
          direction: 'ltr',
          textAlign: 'left'
        }}
        className="p-4 focus:outline-none min-h-[200px] max-w-none editor-content"
        suppressContentEditableWarning={true}
        dir="ltr"
        lang="en"
        spellCheck="true"
      />
    </div>
  );
};

export default RichTextEditor; 