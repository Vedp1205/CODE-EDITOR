import { Circle, ShieldBan, Wifi, X } from 'lucide-react';
import type { User } from '../types';

interface UserPresencePanelProps {
  users: User[];
  ownerId: string;
  currentUserId: string;
  canKickMembers?: boolean;
  onKickMember?: (user: User) => void;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function UserPresencePanel({
  users,
  ownerId,
  currentUserId,
  canKickMembers = false,
  onKickMember,
  className = '',
  showCloseButton = false,
  onClose,
}: UserPresencePanelProps) {
  const now = Date.now();

  return (
    <div className={`w-64 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 flex flex-col h-full ${className}`}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Online</h3>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Circle className="w-2 h-2 fill-green-400 animate-pulse" />
              {users.length}
            </span>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close users panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {users.map(user => {
          const isActive = now - user.lastActive < 5000;
          const isAdmin = user.id === ownerId;
          const canKick = canKickMembers && user.id !== ownerId && user.id !== currentUserId;
          return (
            <div
              key={user.id}
              className="group flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg"
                  style={{ backgroundColor: `${user.color}30` }}
                >
                  {user.avatar}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    isActive ? 'bg-green-400' : 'bg-slate-500'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  {isAdmin && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/20 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                      Admin
                    </span>
                  )}
                </div>
                {user.cursorPosition && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    Line {user.cursorPosition.line}, Col {user.cursorPosition.column}
                  </p>
                )}
              </div>

              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: user.color }}
                title={isActive ? 'Active now' : 'Away'}
              />
              {canKick && onKickMember && (
                <button
                  onClick={() => onKickMember(user)}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                  title={`Kick ${user.name}`}
                >
                  <ShieldBan className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">Live collaboration active</span>
          </div>
          <div className="flex -space-x-2">
            {users.slice(0, 4).map((user, i) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-slate-900"
                style={{ backgroundColor: `${user.color}40`, zIndex: 4 - i }}
              >
                {user.avatar}
              </div>
            ))}
            {users.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 border-2 border-slate-900">
                +{users.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
