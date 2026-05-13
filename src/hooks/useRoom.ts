import { useState, useCallback, useRef, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { User, FileEntry, Room, ChatMessage, Language } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

const COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6',
];

const AVATARS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function createUser(userInput: string | Partial<User>): User {
  const idx = Math.floor(Math.random() * COLORS.length);
  const nextName = typeof userInput === 'string' ? userInput : userInput.name;
  return {
    id: typeof userInput === 'string' ? generateId() : (userInput.id || generateId()),
    name: nextName || `User_${Math.floor(Math.random() * 9999)}`,
    color: typeof userInput === 'string' ? COLORS[idx] : (userInput.color || COLORS[idx]),
    avatar: typeof userInput === 'string' ? AVATARS[idx] : (userInput.avatar || AVATARS[idx]),
    lastActive: Date.now(),
  };
}

export function useRoom() {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const currentUserRef = useRef<User | null>(null);

  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });
    }

    return socketRef.current;
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleRoomState = (nextRoom: Room) => {
      roomIdRef.current = nextRoom.id;
      setRoom(nextRoom);
      setIsJoined(true);
    };

    const handleCodeUpdate = ({ fileId, content, lastModifiedBy }: {
      fileId: string;
      content: string;
      lastModifiedBy: string;
    }) => {
      setRoom(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          files: prev.files.map(file =>
            file.id === fileId
              ? { ...file, content, lastModified: Date.now(), lastModifiedBy }
              : file
          ),
        };
      });
    };

    const handleCursorUpdate = ({ userId, position }: {
      userId: string;
      position: { line: number; column: number };
    }) => {
      setRoom(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          users: prev.users.map(user =>
            user.id === userId
              ? { ...user, cursorPosition: position, lastActive: Date.now() }
              : user
          ),
        };
      });
    };

    const handleNewMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    };

    const handleUserLeft = (userId: string) => {
      setRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.filter(user => user.id !== userId),
        };
      });
    };

    const handleKicked = ({ roomId }: { roomId: string }) => {
      if (roomIdRef.current === roomId) {
        window.localStorage.removeItem('codecollab:last-room-id');
        setIsJoined(false);
        setRoom(null);
        setCurrentUser(null);
        setChatMessages([]);
        roomIdRef.current = null;
        currentUserRef.current = null;
        window.history.replaceState({}, '', window.location.pathname);
        window.alert('You were removed from this room by the admin.');
      }
    };

    socket.on('room-state', handleRoomState);
    socket.on('code-update', handleCodeUpdate);
    socket.on('cursor-update', handleCursorUpdate);
    socket.on('new-message', handleNewMessage);
    socket.on('user-left', handleUserLeft);
    socket.on('kicked', handleKicked);

    return () => {
      socket.off('room-state', handleRoomState);
      socket.off('code-update', handleCodeUpdate);
      socket.off('cursor-update', handleCursorUpdate);
      socket.off('new-message', handleNewMessage);
      socket.off('user-left', handleUserLeft);
      socket.off('kicked', handleKicked);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [getSocket]);

  const createRoom = useCallback((roomName: string, userInput: string | Partial<User>) => {
    const user = createUser(userInput);
    currentUserRef.current = user;
    setCurrentUser(user);
    setChatMessages([]);

    getSocket().emit('create-room', { roomName, user }, ({ room: createdRoom, user: serverUser }: {
      room: Room;
      user: User;
    }) => {
      currentUserRef.current = serverUser;
      roomIdRef.current = createdRoom.id;
      setCurrentUser(serverUser);
      setRoom(createdRoom);
      setIsJoined(true);
    });
  }, [getSocket]);

  const joinRoom = useCallback((roomId: string, userInput: string | Partial<User>) => {
    const user = createUser(userInput);
    currentUserRef.current = user;
    setCurrentUser(user);
    setChatMessages([]);

    getSocket().emit('join-room', { roomId, user }, ({ room: joinedRoom, user: serverUser }: {
      room: Room;
      user: User;
    }) => {
      currentUserRef.current = serverUser;
      roomIdRef.current = joinedRoom.id;
      setCurrentUser(serverUser);
      setRoom(joinedRoom);
      setIsJoined(true);
    });
  }, [getSocket]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    const roomId = roomIdRef.current;
    const user = currentUserRef.current;
    if (!roomId || !user) return;

    setRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        files: prev.files.map(file =>
          file.id === fileId
            ? { ...file, content, lastModified: Date.now(), lastModifiedBy: user.name }
            : file
        ),
      };
    });

    getSocket().emit('code-change', { roomId, fileId, content });
  }, [getSocket]);

  const addFile = useCallback((name: string, language: Language) => {
    const roomId = roomIdRef.current;
    const user = currentUserRef.current;
    const newFile: FileEntry = {
      id: generateId(),
      name,
      language,
      content: getDefaultContent(language),
      lastModified: Date.now(),
      lastModifiedBy: user?.name || 'unknown',
    };

    setRoom(prev => prev ? { ...prev, files: [...prev.files, newFile] } : null);

    if (roomId) {
      getSocket().emit('add-file', { roomId, file: newFile });
    }

    return newFile;
  }, [getSocket]);

  const deleteFile = useCallback((fileId: string) => {
    const roomId = roomIdRef.current;

    if (roomId) {
      getSocket().emit('delete-file', { roomId, fileId });
    }
  }, [getSocket]);

  const recoverFile = useCallback((fileId: string) => {
    const roomId = roomIdRef.current;

    if (roomId) {
      getSocket().emit('recover-file', { roomId, fileId });
    }
  }, [getSocket]);

  const sendChatMessage = useCallback((text: string) => {
    const roomId = roomIdRef.current;
    const user = currentUserRef.current;
    if (!roomId || !user) return;

    const message: ChatMessage = {
      id: generateId(),
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      text,
      timestamp: Date.now(),
    };

    getSocket().emit('chat-message', { roomId, message });
  }, [getSocket]);

  const leaveRoom = useCallback(() => {
    getSocket().disconnect();
    socketRef.current = null;
    roomIdRef.current = null;
    currentUserRef.current = null;
    setIsJoined(false);
    setRoom(null);
    setCurrentUser(null);
    setChatMessages([]);
  }, [getSocket]);

  const kickMember = useCallback((targetUserId: string) => {
    const roomId = roomIdRef.current;
    if (!roomId) return;
    getSocket().emit('kick-member', { roomId, targetUserId });
  }, [getSocket]);

  return {
    room,
    currentUser,
    chatMessages,
    isJoined,
    createRoom,
    joinRoom,
    updateFileContent,
    addFile,
    deleteFile,
    recoverFile,
    sendChatMessage,
    kickMember,
    leaveRoom,
  };
}

function getDefaultContent(language: Language): string {
  const templates: Record<Language, string> = {
    javascript: `// JavaScript template\nconsole.log("Hello, World!");\n`,
    typescript: `// TypeScript template\nconst message: string = "Hello, TypeScript!";\nconsole.log(message);\n`,
    python: `# Python template\nprint("Hello, Python!")\n`,
    cpp: `// C++ template\n#include <iostream>\n\nint main() {\n  std::cout << "Hello, C++!" << std::endl;\n  return 0;\n}\n`,
    java: `// Java template\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}\n`,
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Hello World</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n`,
    css: `body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n}\n`,
    json: `{\n  "name": "CodeCollab",\n  "version": "1.0.0"\n}\n`,
    markdown: `# Welcome to CodeCollab\n\nStart coding with your team.\n`,
  };

  return templates[language] || '// Empty file\n';
}
