import { useState } from 'react';
import { ChevronDown, Clock3, ListChecks, X } from 'lucide-react';
import type { LogEntry } from '../types';

interface ActivityPanelProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

type DiffLine = {
  type: 'added' | 'removed';
  text: string;
};

const ACTION_LABELS: Record<LogEntry['action'], string> = {
  create: 'created room',
  edit: 'updated',
  add: 'added file',
  delete: 'deleted file',
  recover: 'recovered file',
};

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getChangedLines(previousContent: unknown, nextContent: unknown): DiffLine[] {
  const previousLines = typeof previousContent === 'string' ? previousContent.split('\n') : [];
  const nextLines = typeof nextContent === 'string' ? nextContent.split('\n') : [];
  const maxLength = Math.max(previousLines.length, nextLines.length);
  const changes: DiffLine[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const before = previousLines[index];
    const after = nextLines[index];

    if (before === after) continue;

    if (typeof before === 'string') {
      changes.push({ type: 'removed', text: before });
    }

    if (typeof after === 'string') {
      changes.push({ type: 'added', text: after });
    }
  }

  return changes;
}

function getEditSummary(log: LogEntry) {
  const changedLines = getChangedLines(log.details?.previousContent, log.details?.newContent);
  const addedCount = changedLines.filter((line) => line.type === 'added').length;
  const removedCount = changedLines.filter((line) => line.type === 'removed').length;

  if (addedCount === 0 && removedCount === 0) {
    return 'No visible line changes';
  }

  return `${addedCount} added, ${removedCount} removed`;
}

export function ActivityPanel({ logs, isOpen, onToggle, className = '' }: ActivityPanelProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-22 md:bottom-24 right-4 md:right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-3 text-sm font-medium text-slate-100 shadow-2xl shadow-slate-950/40 hover:bg-slate-800 transition-colors"
      >
        <ListChecks className="w-4 h-4" />
        Activity
      </button>
    );
  }

  return (
    <div
      className={`fixed right-5 top-20 z-50 w-[380px] max-h-[calc(100vh-6rem)] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/40 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Activity history</p>
            <p className="text-xs text-slate-500">Who changed files and when</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close activity history"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[calc(100vh-13rem)] overflow-y-auto px-4 py-4 space-y-4">
        {logs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-5 text-center text-slate-500">
            <p className="text-sm font-medium text-slate-200">No activity yet</p>
            <p className="text-xs text-slate-500">Start editing a file to see activity appear here.</p>
          </div>
        ) : (
          logs.slice().reverse().map((log) => {
            const isEdit = log.action === 'edit';
            const isExpanded = expandedLogId === log.id;
            const changedLines = isEdit ? getChangedLines(log.details?.previousContent, log.details?.newContent) : [];

            return (
              <button
                key={log.id}
                type="button"
                onClick={() => setExpandedLogId((current) => (current === log.id ? null : log.id))}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-left transition-colors hover:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-100">
                      <span className="font-semibold text-white">{log.userName}</span>{' '}
                      {ACTION_LABELS[log.action]}
                      {log.fileName ? <span className="text-slate-400"> {log.fileName}</span> : ''}
                    </p>
                    {isEdit && (
                      <p className="mt-1 text-xs text-slate-500">
                        {getEditSummary(log)}
                      </p>
                    )}
                    {!isEdit && typeof log.details?.roomName === 'string' && (
                      <p className="mt-1 text-xs text-slate-500">
                        Room: {log.details.roomName}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-start gap-2">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatTimestamp(log.timestamp)}</p>
                    </div>
                    {isEdit && (
                      <ChevronDown
                        className={`mt-0.5 h-4 w-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </div>

                {isEdit && isExpanded && (
                  <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                    {changedLines.length === 0 ? (
                      <p className="text-xs text-slate-500">No line-level diff available.</p>
                    ) : (
                      changedLines.map((line, index) => (
                        <div
                          key={`${log.id}-${index}`}
                          className={`rounded-xl border px-3 py-2 font-mono text-xs whitespace-pre-wrap break-words ${
                            line.type === 'removed'
                              ? 'border-red-500/20 bg-red-500/10 text-red-200'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <span className="mr-2 font-bold">
                            {line.type === 'removed' ? '-' : '+'}
                          </span>
                          {line.text || '(empty line)'}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-slate-400" />
          Real-time activity is synced live for all collaborators.
        </div>
      </div>
    </div>
  );
}
