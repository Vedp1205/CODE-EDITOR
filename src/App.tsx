import { FolderOpen, MessageCircle, Play, Users } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TopBar } from './components/TopBar';
import { FileExplorer } from './components/FileExplorer';
import { EditorPanel } from './components/EditorPanel';
import { UserPresencePanel } from './components/UserPresencePanel';
import { ChatPanel } from './components/ChatPanel';
import { CodeExecutionPanel } from './components/CodeExecutionPanel';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { useRoom } from './hooks/useRoom';

const LAST_ROOM_KEY = 'codecollab:last-room-id';
const LAST_USER_KEY = 'codecollab:last-user-name';

export function App() {
  const sharedRoomId = new URLSearchParams(window.location.search).get('room')?.trim() || '';
  const {
    room,
    currentUser,
    chatMessages,
    isJoined,
    createRoom,
    joinRoom,
    updateFileContent,
    addFile,
    deleteFile,
    sendChatMessage,
    leaveRoom,
  } = useRoom();

  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [archOpen, setArchOpen] = useState(false);
  const [mobileExplorerOpen, setMobileExplorerOpen] = useState(false);
  const [mobileUsersOpen, setMobileUsersOpen] = useState(false);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

  const activeFile = room?.files.find(f => f.id === activeFileId) || null;

  useEffect(() => {
    if (!room) {
      setActiveFileId(null);
      return;
    }

    if (!activeFileId && room.files.length > 0) {
      setActiveFileId(room.files[0].id);
      return;
    }

    if (activeFileId && !room.files.some(file => file.id === activeFileId)) {
      setActiveFileId(room.files[0]?.id || null);
    }
  }, [activeFileId, room]);

  const handleCreateRoom = useCallback((name: string, userName: string) => {
    createRoom(name, userName);
  }, [createRoom]);

  const handleJoinRoom = useCallback((roomId: string, userName: string) => {
    joinRoom(roomId, userName);
  }, [joinRoom]);

  const handleFileContentChange = useCallback((content: string) => {
    if (activeFileId) {
      updateFileContent(activeFileId, content);
    }
  }, [activeFileId, updateFileContent]);

  const closeMobilePanels = useCallback(() => {
    setMobileExplorerOpen(false);
    setMobileUsersOpen(false);
    setChatOpen(false);
  }, []);

  useEffect(() => {
    if (!room || !currentUser) return;

    const nextUrl = `${window.location.pathname}?room=${room.id}`;
    window.history.replaceState({}, '', nextUrl);
    window.localStorage.setItem(LAST_ROOM_KEY, room.id);
    window.localStorage.setItem(LAST_USER_KEY, currentUser.name);
  }, [room, currentUser]);

  useEffect(() => {
    if (isJoined || autoJoinAttempted) return;

    const rememberedUser = window.localStorage.getItem(LAST_USER_KEY)?.trim() || '';
    const rememberedRoom = window.localStorage.getItem(LAST_ROOM_KEY)?.trim() || '';
    const roomToJoin = sharedRoomId || rememberedRoom;

    if (roomToJoin && rememberedUser) {
      joinRoom(roomToJoin, rememberedUser);
      setAutoJoinAttempted(true);
      return;
    }

    setAutoJoinAttempted(true);
  }, [autoJoinAttempted, isJoined, joinRoom, sharedRoomId]);

  if (!isJoined) {
    return (
      <>
        <WelcomeScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          initialRoomId={sharedRoomId}
        />
        <ArchitectureDiagram isOpen={archOpen} onClose={() => setArchOpen(false)} />
      </>
    );
  }

  if (!room || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-400 text-lg">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] md:h-screen bg-slate-950 flex flex-col overflow-x-hidden overflow-y-auto md:overflow-hidden">
      <TopBar
        room={room}
        currentUser={currentUser}
        onLeaveRoom={leaveRoom}
        onOpenExplorer={() => {
          setMobileUsersOpen(false);
          setChatOpen(false);
          setMobileExplorerOpen(true);
        }}
        onOpenUsers={() => {
          setMobileExplorerOpen(false);
          setChatOpen(false);
          setMobileUsersOpen(true);
        }}
        onOpenChat={() => {
          setMobileExplorerOpen(false);
          setMobileUsersOpen(false);
          setChatOpen(true);
        }}
        onToggleExecution={() => setExecutionOpen(prev => !prev)}
      />

      <div className="md:hidden px-3 py-2 bg-slate-900/70 border-b border-white/10">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => {
              setMobileUsersOpen(false);
              setChatOpen(false);
              setMobileExplorerOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200"
          >
            <FolderOpen className="w-4 h-4" />
            Files
          </button>
          <button
            onClick={() => setExecutionOpen(prev => !prev)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          <button
            onClick={() => {
              setMobileExplorerOpen(false);
              setChatOpen(false);
              setMobileUsersOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200"
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => {
              setMobileExplorerOpen(false);
              setMobileUsersOpen(false);
              setChatOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-visible md:overflow-hidden">
        <FileExplorer
          files={room.files}
          activeFileId={activeFileId ?? ''}
          onSelectFile={setActiveFileId}
          onAddFile={addFile}
          onDeleteFile={deleteFile}
          className="hidden md:flex"
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {activeFile && (
            <div className="h-11 bg-slate-900/60 border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto">
              {room.files.map(file => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shrink-0 ${
                    activeFileId === file.id
                      ? 'bg-white/10 text-white border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-b-2 border-transparent'
                  }`}
                >
                  <span className={`text-xs font-bold ${
                    file.language === 'javascript' ? 'text-yellow-400' :
                    file.language === 'python' ? 'text-green-400' :
                    file.language === 'cpp' ? 'text-purple-400' :
                    file.language === 'java' ? 'text-orange-400' :
                    'text-slate-400'
                  }`}>
                    {file.language === 'javascript' ? 'JS' :
                     file.language === 'python' ? 'PY' :
                     file.language === 'cpp' ? 'C+' :
                     file.language === 'java' ? 'JV' :
                     file.language === 'html' ? '<>' :
                     file.language === 'css' ? '{}' :
                     file.language === 'json' ? '{}' :
                     file.language === 'markdown' ? 'MD' :
                     'TX'}
                  </span>
                  <span className="max-w-28 truncate sm:max-w-none">{file.name}</span>
                  {activeFileId === file.id && (
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full ml-1" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <EditorPanel
              content={activeFile?.content || ''}
              language={activeFile?.language || ''}
              onChange={handleFileContentChange}
              isActive={!!activeFile}
            />
          </div>

          <CodeExecutionPanel
            isOpen={executionOpen}
            onToggle={() => setExecutionOpen(!executionOpen)}
          />
        </div>

        <UserPresencePanel users={room.users} className="hidden xl:flex" />

        <ChatPanel
          messages={chatMessages}
          onSendMessage={sendChatMessage}
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          className="hidden lg:flex"
        />
      </div>

      <div className="hidden md:flex h-7 bg-indigo-600 items-center justify-between px-4 text-xs text-white/90">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Connected
          </span>
          <span>Room: {room.name}</span>
          <span>Users: {room.users.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{activeFile?.name || 'No file selected'}</span>
          <span>{activeFile?.language || 'Plain Text'}</span>
          <span>UTF-8</span>
          <span>Monaco Editor</span>
        </div>
      </div>

      <button
        onClick={() => setArchOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-2xl shadow-cyan-500/40 flex items-center justify-center hover:scale-110 transition-transform"
        title="View Architecture & Setup Guide"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </button>

      {mobileExplorerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            onClick={closeMobilePanels}
            className="flex-1 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close files panel"
          />
          <FileExplorer
            files={room.files}
            activeFileId={activeFileId ?? ''}
            onSelectFile={(fileId) => {
              setActiveFileId(fileId);
              setMobileExplorerOpen(false);
            }}
            onAddFile={addFile}
            onDeleteFile={deleteFile}
            className="w-[86vw] max-w-sm shrink-0"
            showCloseButton
            onClose={closeMobilePanels}
          />
        </div>
      )}

      {mobileUsersOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            onClick={closeMobilePanels}
            className="flex-1 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close users panel"
          />
          <UserPresencePanel
            users={room.users}
            className="w-[86vw] max-w-sm shrink-0"
            showCloseButton
            onClose={closeMobilePanels}
          />
        </div>
      )}

      {chatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            isOpen={chatOpen}
            onToggle={() => setChatOpen(false)}
            className="w-full h-full border-l-0"
          />
        </div>
      )}
    </div>
  );
}
