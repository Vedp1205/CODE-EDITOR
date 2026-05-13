import { useState } from 'react';
import { Download, FileCode2, FilePlus, Trash2, X } from 'lucide-react';
import type { FileEntry, Language } from '../types';

interface FileExplorerProps {
  files: FileEntry[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onAddFile: (name: string, language: Language) => void;
  onDeleteFile: (fileId: string) => void;
  onDownloadFile: (file: FileEntry) => void;
  canManageFiles?: boolean;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const LANGUAGE_ICONS: Record<string, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  cpp: 'C++',
  java: 'JV',
  html: '<>',
  css: '{}',
  json: '{}',
  markdown: 'MD',
};

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: 'text-yellow-400',
  typescript: 'text-blue-400',
  python: 'text-green-400',
  cpp: 'text-purple-400',
  java: 'text-orange-400',
  html: 'text-red-400',
  css: 'text-pink-400',
  json: 'text-emerald-400',
  markdown: 'text-slate-400',
};

export function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onDownloadFile,
  canManageFiles = true,
  className = '',
  showCloseButton = false,
  onClose,
}: FileExplorerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState<Language>('javascript');

  const handleAddFile = () => {
    if (newFileName.trim()) {
      onAddFile(newFileName.trim(), newFileLang);
      setNewFileName('');
      setIsAdding(false);
    }
  };

  return (
    <div className={`w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-full ${className}`}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Explorer</h3>
          <div className="flex items-center gap-2">
            {canManageFiles && (
              <button
                onClick={() => setIsAdding(true)}
                className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors"
                title="Add new file"
              >
                <FilePlus className="w-4 h-4" />
              </button>
            )}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close explorer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isAdding && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
            <input
              type="text"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="filename.js"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={e => e.key === 'Enter' && handleAddFile()}
              autoFocus
            />
            <select
              value={newFileLang}
              onChange={e => setNewFileLang(e.target.value as Language)}
              className="codecollab-select w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddFile}
                className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-1.5 bg-white/10 text-slate-400 text-xs font-medium rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!canManageFiles && (
          <div className="mt-3 rounded-xl border border-amber-400/10 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Only the room admin can add or remove files.
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
              activeFileId === file.id
                ? 'bg-indigo-500/20 text-white border-l-2 border-indigo-500'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              activeFileId === file.id ? 'bg-indigo-500/30' : 'bg-white/5'
            } ${LANGUAGE_COLORS[file.language] || 'text-slate-400'}`}>
              {LANGUAGE_ICONS[file.language] || 'TX'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{file.language || 'Plain Text'}</p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                onDownloadFile(file);
              }}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-slate-500 hover:text-cyan-300 transition-all"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            {canManageFiles && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDeleteFile(file.id);
                }}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <FileCode2 className="w-4 h-4" />
          <span>{files.length} files</span>
        </div>
      </div>
    </div>
  );
}
