import { Clock3, ListChecks, X } from 'lucide-react';
import type { LogEntry } from '../types';

interface ActivityPanelProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const ACTION_LABELS: Record<LogEntry['action'], string> = {
  create: 'created room',
  edit: 'edited',
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

export function ActivityPanel({ logs, isOpen, onToggle, className = '' }: ActivityPanelProps) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-3 text-sm font-medium text-slate-100 shadow-2xl shadow-slate-950/40 hover:bg-slate-800 transition-colors"
      >
        <ListChecks className="w-4 h-4" />
        Activity
      </button>
    );
  }

  return (
    <div
      className={`fixed right-5 top-20 z-50 w-[360px] max-h-[calc(100vh-6rem)] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/40 backdrop-blur-xl ${className}`}
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
          logs.slice().reverse().map((log) => (
            <div key={log.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-100">
                    <span className="font-semibold text-white">{log.userName}</span>{' '}
                    {ACTION_LABELS[log.action]}
                    {log.fileName ? <span className="text-slate-400"> {log.fileName}</span> : ''}
                  </p>
                  {log.details?.previousLength !== undefined && (
                    <p className="mt-1 text-xs text-slate-500">
                      {typeof log.details.previousLength === 'number' && typeof log.details.newLength === 'number'
                        ? `Size: ${log.details.previousLength} → ${log.details.newLength} chars`
                        : null}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatTimestamp(log.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
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
