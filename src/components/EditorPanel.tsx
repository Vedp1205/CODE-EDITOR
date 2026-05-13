import { useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import type { Language } from '../types';

interface EditorPanelProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
  isActive: boolean;
}

const LANGUAGE_MAP: Record<string, Language> = {
  javascript: 'javascript',
  typescript: 'typescript',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  python: 'python',
  cpp: 'cpp',
  c: 'cpp',
  java: 'java',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  markdown: 'markdown',
};

export function EditorPanel({ content, language, onChange, isActive }: EditorPanelProps) {
  const monacoLang = useMemo(() => {
    const mapped = LANGUAGE_MAP[language.toLowerCase()];
    return mapped || 'javascript';
  }, [language]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    onChange(value || '');
  }, [onChange]);

  if (!isActive) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <p className="text-slate-500 text-lg">Select a file to start editing</p>
          <p className="text-slate-600 text-sm mt-2">Choose from the file explorer on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-hidden">
      <Editor
        height="100%"
        language={monacoLang}
        value={content}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: true, scale: 2 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: { top: 16 },
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-slate-950">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading editor...</p>
            </div>
          </div>
        }
      />
    </div>
  );
}
