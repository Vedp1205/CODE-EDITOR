import { useState, useEffect } from 'react';
import {
  CheckCircle,
  ChevronDown,
  Code2,
  Copy,
  LogOut,
  Menu,
  MessageCircle,
  Play,
  Share2,
  Users,
  Wifi,
} from 'lucide-react';
import type { User, Room } from '../types';

interface TopBarProps {
  room: Room;
  currentUser: User;
  isAdmin: boolean;
  onLeaveRoom: () => void;
  onOpenExplorer: () => void;
  onOpenUsers: () => void;
  onOpenChat: () => void;
  onToggleExecution: () => void;
}

export function TopBar({
  room,
  currentUser,
  isAdmin,
  onLeaveRoom,
  onOpenExplorer,
  onOpenUsers,
  onOpenChat,
  onToggleExecution,
}: TopBarProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const roomId = room.id;
  const shareUrl = `${window.location.origin}?room=${roomId}`;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
    }
  };

  return (
    <div className="h-14 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3 sm:px-4 z-50">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onOpenExplorer}
          className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Open files"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight truncate max-w-36 sm:max-w-none">
              {room.name}
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-400">Live</span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/20 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
          <span className="text-xs text-slate-400">Room ID:</span>
          <code className="text-xs text-indigo-400 font-mono">{roomId.slice(0, 8)}...</code>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-300">{room.users.length} online</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={onToggleExecution}
            className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="Run code"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenUsers}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Open users"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenChat}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Open chat"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleCopy}
          className={`hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share
            </>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.avatar}
            </div>
            <span className="hidden sm:block text-sm text-slate-300 max-w-24 truncate">{currentUser.name}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${currentUser.color}30` }}
                    >
                      {currentUser.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                      <p className="text-xs text-slate-400">{isAdmin ? 'Room Admin' : 'Collaborator'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleCopy();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Room Link
                  </button>
                  <button
                    onClick={() => {
                      onOpenUsers();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    View All Users
                  </button>
                  {isAdmin && (
                    <div className="px-3 py-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-400/10 rounded-lg mx-1 my-1">
                      Admin controls: file management and room ownership
                    </div>
                  )}
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={onLeaveRoom}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Room
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
