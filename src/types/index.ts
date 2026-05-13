export interface User {
  id: string;
  name: string;
  color: string;
  avatar: string;
  cursorPosition?: { line: number; column: number };
  lastActive: number;
}

export interface FileEntry {
  id: string;
  name: string;
  language: string;
  content: string;
  lastModified: number;
  lastModifiedBy: string;
}

export interface Room {
  id: string;
  name: string;
  owner: string;
  files: FileEntry[];
  users: User[];
  createdAt: number;
  isPublic: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  timestamp: number;
}

export type Language = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java' | 'html' | 'css' | 'json' | 'markdown';
