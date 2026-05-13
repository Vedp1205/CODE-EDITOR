import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

dotenv.config();

const logSchema = new mongoose.Schema({
  roomId: String,
  userId: String,
  userName: String,
  action: String, // 'edit', 'delete', 'recover'
  fileId: String,
  fileName: String,
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed, // for additional info
});

const Log = mongoose.model('Log', logSchema);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'codecollab-server' });
});

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB connection failed:', error.message));
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN === '*' ? '*' : CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map();
const pendingEditLogs = new Map();
const EDIT_LOG_DEBOUNCE_MS = 1500;

const COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6',
];

const AVATARS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const DEFAULT_FILES = [
  {
    id: '1',
    name: 'main.js',
    language: 'javascript',
    content: `// Welcome to CodeCollab!\n// Start coding with your team in real time\n\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconst results = [];\nfor (let i = 0; i < 10; i++) {\n  results.push(fibonacci(i));\n}\n\nconsole.log("Fibonacci sequence:", results);\n`,
    lastModified: Date.now(),
    lastModifiedBy: 'system',
    deleted: false,
  },
  {
    id: '2',
    name: 'utils.py',
    language: 'python',
    content: `def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\nprint(quick_sort([64, 34, 25, 12, 22, 11, 90]))\n`,
    lastModified: Date.now(),
    lastModifiedBy: 'system',
    deleted: false,
  },
];

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function normalizeUser(user = {}) {
  const idx = Math.floor(Math.random() * COLORS.length);
  return {
    id: user.id || generateId(),
    name: user.name || `User_${Math.floor(Math.random() * 9999)}`,
    color: user.color || COLORS[idx],
    avatar: user.avatar || AVATARS[idx],
    lastActive: Date.now(),
  };
}

function createRoom(roomName, user) {
  const roomId = generateId();
  return {
    id: roomId,
    name: roomName || 'Untitled Room',
    owner: user.id,
    files: DEFAULT_FILES.map((file) => ({ ...file, lastModified: Date.now() })),
    users: [user],
    logs: [
      {
        id: generateId(),
        action: 'create',
        userId: user.id,
        userName: user.name,
        timestamp: Date.now(),
        details: { roomName: roomName || 'Untitled Room' },
      },
    ],
    createdAt: Date.now(),
    isPublic: true,
  };
}

function addRoomLog(roomId, log) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.logs = [
    ...room.logs,
    {
      id: generateId(),
      timestamp: Date.now(),
      ...log,
    },
  ].slice(-100);
}

function createPendingEditKey(roomId, userId, fileId) {
  return `${roomId}:${userId}:${fileId}`;
}

function persistEditLog(roomId, pendingEdit) {
  const details = {
    previousLength: pendingEdit.previousContent.length,
    newLength: pendingEdit.newContent.length,
    previousContent: pendingEdit.previousContent,
    newContent: pendingEdit.newContent,
  };

  addRoomLog(roomId, {
    action: 'edit',
    userId: pendingEdit.userId,
    userName: pendingEdit.userName,
    fileId: pendingEdit.fileId,
    fileName: pendingEdit.fileName,
    details,
  });

  if (process.env.MONGODB_URI) {
    const log = new Log({
      roomId,
      userId: pendingEdit.userId,
      userName: pendingEdit.userName,
      action: 'edit',
      fileId: pendingEdit.fileId,
      fileName: pendingEdit.fileName,
      details,
    });
    log.save().catch(err => console.error('Log save error:', err));
  }
}

function flushPendingEditLog(key) {
  const pendingEdit = pendingEditLogs.get(key);
  if (!pendingEdit) return;

  clearTimeout(pendingEdit.timer);
  pendingEditLogs.delete(key);
  persistEditLog(pendingEdit.roomId, pendingEdit);
  emitRoomState(pendingEdit.roomId);
}

function queueEditLog({ roomId, userId, userName, fileId, fileName, previousContent, newContent }) {
  const key = createPendingEditKey(roomId, userId, fileId);
  const existing = pendingEditLogs.get(key);

  if (existing) {
    clearTimeout(existing.timer);
    existing.userName = userName;
    existing.fileName = fileName;
    existing.newContent = newContent;
    existing.timer = setTimeout(() => flushPendingEditLog(key), EDIT_LOG_DEBOUNCE_MS);
    pendingEditLogs.set(key, existing);
    return;
  }

  pendingEditLogs.set(key, {
    roomId,
    userId,
    userName,
    fileId,
    fileName,
    previousContent,
    newContent,
    timer: setTimeout(() => flushPendingEditLog(key), EDIT_LOG_DEBOUNCE_MS),
  });
}

function emitRoomState(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    io.to(roomId).emit('room-state', room);
  }
}

function findSocketByUserId(roomId, userId) {
  for (const socket of io.sockets.sockets.values()) {
    if (socket.data.roomId === roomId && socket.data.userId === userId) {
      return socket;
    }
  }
  return null;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-room', ({ roomName, user }, callback) => {
    const normalizedUser = normalizeUser(user);
    const room = createRoom(roomName, normalizedUser);
    rooms.set(room.id, room);
    socket.data.roomId = room.id;
    socket.data.userId = normalizedUser.id;
    socket.join(room.id);
    callback?.({ room, user: normalizedUser });
    emitRoomState(room.id);
  });

  socket.on('join-room', ({ roomId, user }, callback) => {
    const normalizedUser = normalizeUser(user);
    if (!rooms.has(roomId)) {
      const room = createRoom('Shared Room', normalizedUser);
      room.id = roomId;
      rooms.set(roomId, room);
    } else {
      const room = rooms.get(roomId);
      const existingIndex = room.users.findIndex((roomUser) => roomUser.id === normalizedUser.id);
      if (existingIndex >= 0) {
        room.users[existingIndex] = normalizedUser;
      } else {
        room.users.push(normalizedUser);
      }
    }

    socket.data.roomId = roomId;
    socket.data.userId = normalizedUser.id;
    socket.join(roomId);
    callback?.({ room: rooms.get(roomId), user: normalizedUser });
    emitRoomState(roomId);
  });

  socket.on('code-change', ({ roomId, fileId, content }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const file = room.files.find(f => f.id === fileId);
      const user = room.users.find(u => u.id === socket.data.userId);

      room.files = room.files.map((file) => (
        file.id === fileId
          ? {
              ...file,
              content,
              lastModified: Date.now(),
              lastModifiedBy: socket.data.userId || socket.id,
            }
          : file
      ));

      if (file && user) {
        queueEditLog({
          roomId,
          userId: user.id,
          userName: user.name,
          fileId,
          fileName: file.name,
          previousContent: file.content,
          newContent: content,
        });
      }

      socket.to(roomId).emit('code-update', {
        fileId,
        content,
        lastModifiedBy: socket.data.userId || socket.id,
      });
    });
  socket.on('add-file', ({ roomId, file }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.files.push(file);

    const user = room.users.find(u => u.id === socket.data.userId);
    if (file && user) {
      addRoomLog(roomId, {
        action: 'add',
        userId: user.id,
        userName: user.name,
        fileId: file.id,
        fileName: file.name,
      });
    }

    emitRoomState(roomId);
  });

  socket.on('delete-file', ({ roomId, fileId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const file = room.files.find(f => f.id === fileId);
    const user = room.users.find(u => u.id === socket.data.userId);

    room.files = room.files.map((file) => (
      file.id === fileId
        ? { ...file, deleted: true, lastModified: Date.now(), lastModifiedBy: socket.data.userId || socket.id }
        : file
    ));

    if (file && user) {
      addRoomLog(roomId, {
        action: 'delete',
        userId: user.id,
        userName: user.name,
        fileId,
        fileName: file.name,
      });
    }

    // Log the delete
    if (process.env.MONGODB_URI && file && user) {
      const log = new Log({
        roomId,
        userId: user.id,
        userName: user.name,
        action: 'delete',
        fileId,
        fileName: file.name,
      });
      log.save().catch(err => console.error('Log save error:', err));
    }

    emitRoomState(roomId);
  });

  socket.on('recover-file', ({ roomId, fileId }) => {
    const room = rooms.get(roomId);
    if (!room || room.owner !== socket.data.userId) return;
    const file = room.files.find(f => f.id === fileId);
    const user = room.users.find(u => u.id === socket.data.userId);

    room.files = room.files.map((file) => (
      file.id === fileId
        ? { ...file, deleted: false, lastModified: Date.now(), lastModifiedBy: socket.data.userId || socket.id }
        : file
    ));

    if (file && user) {
      addRoomLog(roomId, {
        action: 'recover',
        userId: user.id,
        userName: user.name,
        fileId,
        fileName: file.name,
      });
    }

    // Log the recover
    if (process.env.MONGODB_URI && file && user) {
      const log = new Log({
        roomId,
        userId: user.id,
        userName: user.name,
        action: 'recover',
        fileId,
        fileName: file.name,
      });
      log.save().catch(err => console.error('Log save error:', err));
    }

    emitRoomState(roomId);
  });

  socket.on('cursor-move', ({ roomId, position }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.users = room.users.map((user) => (
      user.id === socket.data.userId
        ? { ...user, cursorPosition: position, lastActive: Date.now() }
        : user
    ));

    socket.to(roomId).emit('cursor-update', {
      userId: socket.data.userId,
      position,
    });
  });

  socket.on('chat-message', ({ roomId, message }) => {
    io.to(roomId).emit('new-message', message);
  });

  socket.on('kick-member', ({ roomId, targetUserId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    if (room.owner !== socket.data.userId) return;
    if (room.owner === targetUserId) return;

    const targetSocket = findSocketByUserId(roomId, targetUserId);
    room.users = room.users.filter((user) => user.id !== targetUserId);

    if (targetSocket) {
      targetSocket.emit('kicked', { roomId });
      targetSocket.leave(roomId);
      targetSocket.data.roomId = null;
    }

    io.to(roomId).emit('user-left', targetUserId);
    emitRoomState(roomId);
  });

  socket.on('disconnecting', () => {
    const { roomId, userId } = socket.data;
    if (!roomId || !rooms.has(roomId)) return;

    for (const key of [...pendingEditLogs.keys()]) {
      if (key.startsWith(`${roomId}:${userId}:`)) {
        flushPendingEditLog(key);
      }
    }

    const room = rooms.get(roomId);
    room.users = room.users.filter((user) => user.id !== userId);
    socket.to(roomId).emit('user-left', userId);

    if (room.users.length === 0) {
      rooms.delete(roomId);
    } else {
      emitRoomState(roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`CodeCollab Socket.IO server running on port ${PORT}`);
});
