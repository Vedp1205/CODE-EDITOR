import { useState } from 'react';
import { X, Server, Monitor, Database, Globe, Wifi, Code2, Zap } from 'lucide-react';

interface ArchitectureDiagramProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureDiagram({ isOpen, onClose }: ArchitectureDiagramProps) {
  const [activeTab, setActiveTab] = useState<'architecture' | 'folder' | 'packages'>('architecture');

  if (!isOpen) {
    return (
      <button
        onClick={onClose}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-2xl shadow-cyan-500/40 flex items-center justify-center hover:scale-110 transition-transform"
        title="View Architecture & Setup Guide"
      >
        <Server className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Architecture & Setup Guide</h2>
              <p className="text-sm text-slate-400">Complete MERN stack collaborative code editor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-white/10">
          {[
            { id: 'architecture' as const, label: 'System Architecture', icon: Globe },
            { id: 'folder' as const, label: 'Folder Structure', icon: Monitor },
            { id: 'packages' as const, label: 'NPM Packages', icon: Code2 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-b-2 border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'architecture' && (
            <div className="space-y-8">
              {/* Architecture Diagram */}
              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 text-center">High-Level System Architecture</h3>
                
                {/* Visual Architecture */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Client Layer */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Monitor className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-blue-400">Client Layer</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full" />
                        React + TypeScript SPA
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full" />
                        Monaco Editor (VS Code engine)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full" />
                        Socket.io Client
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full" />
                        Tailwind CSS UI
                      </li>
                    </ul>
                  </div>

                  {/* Server Layer */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Server className="w-5 h-5 text-purple-400" />
                      <h4 className="font-semibold text-purple-400">Server Layer</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full" />
                        Node.js + Express.js
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full" />
                        Socket.io Server
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full" />
                        REST API Endpoints
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full" />
                        JWT Authentication
                      </li>
                    </ul>
                  </div>

                  {/* Data Layer */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-green-400">Data Layer</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        MongoDB (Rooms, Files)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        Redis (Sessions, Cache)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        Judge0 API (Code Exec)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        Docker Sandbox (Optional)
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Data Flow */}
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
                  <h4 className="font-semibold text-white mb-4">Real-time Data Flow</h4>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                    <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg font-medium">
                      User Types Code
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg font-medium">
                      Socket.io emit()
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg font-medium">
                      Server Broadcasts
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 text-pink-400 rounded-lg font-medium">
                      Other Clients Update
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg font-medium">
                      MongoDB Persist
                    </div>
                  </div>
                </div>
              </div>

              {/* Socket.io Logic */}
              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  Socket.io Sync Logic
                </h3>
                <pre className="bg-slate-950 border border-white/10 rounded-xl p-5 text-sm font-mono overflow-x-auto">
                  <code className="text-slate-300">{`// Server-side Socket.io Handler
io.on('connection', (socket) => {
  
  // User joins a room
  socket.on('join-room', (roomId, userData) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userName: userData.name,
      color: userData.color
    });
    
    // Send current room state
    socket.emit('room-state', {
      files: getRoomFiles(roomId),
      users: getRoomUsers(roomId)
    });
  });
  
  // Sync code changes
  socket.on('code-change', ({ roomId, fileId, content }) => {
    socket.to(roomId).emit('code-update', {
      fileId,
      content,
      userId: socket.id,
      timestamp: Date.now()
    });
    
    // Persist to MongoDB
    saveFileContent(roomId, fileId, content);
  });
  
  // Cursor position sync
  socket.on('cursor-move', ({ roomId, position }) => {
    socket.to(roomId).emit('cursor-update', {
      userId: socket.id,
      position,
      color: userData.color
    });
  });
  
  // Chat messages
  socket.on('chat-message', ({ roomId, message }) => {
    socket.to(roomId).emit('new-message', {
      userId: socket.id,
      userName: userData.name,
      color: userData.color,
      text: message,
      timestamp: Date.now()
    });
  });
  
  // Code execution request
  socket.on('execute-code', async ({ roomId, language, code }) => {
    try {
      const result = await judge0.submissions.create({
        language_id: getLanguageId(language),
        source_code: code,
        stdin: ""
      });
      
      // Poll for result
      const sub = await judge0.submissions.get(result.id);
      socket.to(roomId).emit('execution-result', {
        output: sub.output,
        status: sub.status.description
      });
    } catch (err) {
      socket.to(roomId).emit('execution-error', {
        error: err.message
      });
    }
  });
  
  socket.on('disconnect', () => {
    socket.to(roomId).emit('user-left', {
      userId: socket.id
    });
  });
});`}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'folder' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Project Folder Structure</h3>
                <pre className="bg-slate-950 border border-white/10 rounded-xl p-6 text-sm font-mono overflow-x-auto">
                  <code className="text-slate-300">{`codecollab/
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.tsx    # Landing page
│   │   │   ├── EditorPanel.tsx      # Monaco Editor wrapper
│   │   │   ├── FileExplorer.tsx     # File tree sidebar
│   │   │   ├── TopBar.tsx           # Room info & actions
│   │   │   ├── UserPresencePanel.tsx # Online users
│   │   │   ├── ChatPanel.tsx        # Team chat
│   │   │   └── CodeExecutionPanel.tsx # Output console
│   │   ├── hooks/
│   │   │   └── useRoom.ts           # Room state management
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── cn.ts                # Tailwind utilities
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # MongoDB connection
│   │   │   ├── redis.ts             # Redis connection
│   │   │   └── socket.ts            # Socket.io setup
│   │   ├── models/
│   │   │   ├── Room.ts              # Room schema
│   │   │   ├── File.ts              # File schema
│   │   │   ├── User.ts              # User schema
│   │   │   └── Message.ts           # Chat message schema
│   │   ├── routes/
│   │   │   ├── roomRoutes.ts        # Room CRUD
│   │   │   ├── fileRoutes.ts        # File operations
│   │   │   ├── authRoutes.ts        # Authentication
│   │   │   └── executeRoutes.ts     # Code execution
│   │   ├── sockets/
│   │   │   └── index.ts             # Socket.io handlers
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT middleware
│   │   │   └── errorHandler.ts     # Error handling
│   │   ├── utils/
│   │   │   └── judge0.ts           # Judge0 API client
│   │   ├── server.ts                # Express app
│   │   └── app.ts                   # App initialization
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml               # Docker services
├── .env                             # Environment variables
└── README.md                        # Documentation`}</code>
                </pre>
              </div>

              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key API Endpoints</h3>
                <div className="space-y-3">
                  {[
                    { method: 'POST', path: '/api/rooms', desc: 'Create a new room' },
                    { method: 'GET', path: '/api/rooms/:id', desc: 'Get room details' },
                    { method: 'POST', path: '/api/rooms/:id/join', desc: 'Join a room' },
                    { method: 'GET', path: '/api/rooms/:id/files', desc: 'List room files' },
                    { method: 'POST', path: '/api/rooms/:id/files', desc: 'Create a file' },
                    { method: 'PUT', path: '/api/files/:id', desc: 'Update file content' },
                    { method: 'DELETE', path: '/api/files/:id', desc: 'Delete a file' },
                    { method: 'POST', path: '/api/execute', desc: 'Execute code' },
                    { method: 'GET', path: '/api/rooms/:id/users', desc: 'List room users' },
                  ].map((route, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-900/50 border border-white/5 rounded-lg p-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        route.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                        route.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {route.method}
                      </span>
                      <code className="text-sm text-slate-300 font-mono flex-1">{route.path}</code>
                      <span className="text-sm text-slate-500">{route.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Required NPM Packages</h3>
                
                <div className="space-y-4">
                  {/* Client Packages */}
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Client Packages
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: 'react', desc: 'UI library', ver: '^18.x' },
                        { name: 'react-dom', desc: 'React DOM renderer', ver: '^18.x' },
                        { name: '@monaco-editor/react', desc: 'Monaco editor for React', ver: '^4.x' },
                        { name: 'monaco-editor', desc: 'VS Code editor engine', ver: '^0.44.x' },
                        { name: 'socket.io-client', desc: 'Real-time communication', ver: '^4.x' },
                        { name: 'lucide-react', desc: 'Icon library', ver: '^0.x' },
                        { name: 'tailwindcss', desc: 'Utility-first CSS', ver: '^3.x' },
                        { name: 'vite', desc: 'Build tool', ver: '^5.x' },
                        { name: 'typescript', desc: 'TypeScript support', ver: '^5.x' },
                      ].map((pkg, i) => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <code className="text-sm text-cyan-400 font-mono font-semibold">{pkg.name}</code>
                            <p className="text-xs text-slate-500 mt-0.5">{pkg.desc}</p>
                          </div>
                          <span className="text-xs text-slate-600 font-mono">{pkg.ver}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Server Packages */}
                  <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Server Packages
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: 'express', desc: 'Web framework', ver: '^4.x' },
                        { name: 'socket.io', desc: 'WebSocket server', ver: '^4.x' },
                        { name: 'mongoose', desc: 'MongoDB ODM', ver: '^7.x' },
                        { name: 'mongodb', desc: 'MongoDB driver', ver: '^6.x' },
                        { name: 'jsonwebtoken', desc: 'JWT auth', ver: '^9.x' },
                        { name: 'bcryptjs', desc: 'Password hashing', ver: '^2.x' },
                        { name: 'cors', desc: 'CORS middleware', ver: '^2.x' },
                        { name: 'dotenv', desc: 'Environment variables', ver: '^16.x' },
                        { name: 'redis', desc: 'Redis client', ver: '^4.x' },
                        { name: 'judge0', desc: 'Code execution API', ver: '^2.x' },
                        { name: 'helmet', desc: 'Security headers', ver: '^7.x' },
                        { name: 'express-rate-limit', desc: 'Rate limiting', ver: '^7.x' },
                      ].map((pkg, i) => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <code className="text-sm text-purple-400 font-mono font-semibold">{pkg.name}</code>
                            <p className="text-xs text-slate-500 mt-0.5">{pkg.desc}</p>
                          </div>
                          <span className="text-xs text-slate-600 font-mono">{pkg.ver}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dev Packages */}
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Dev Packages
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: 'typescript', desc: 'TypeScript compiler', ver: '^5.x' },
                        { name: '@types/express', desc: 'Express type definitions', ver: '^4.x' },
                        { name: '@types/node', desc: 'Node.js type definitions', ver: '^20.x' },
                        { name: '@types/react', desc: 'React type definitions', ver: '^18.x' },
                        { name: 'nodemon', desc: 'Auto-restart server', ver: '^3.x' },
                        { name: 'ts-node', desc: 'TypeScript execution', ver: '^10.x' },
                      ].map((pkg, i) => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <code className="text-sm text-yellow-400 font-mono font-semibold">{pkg.name}</code>
                            <p className="text-xs text-slate-500 mt-0.5">{pkg.desc}</p>
                          </div>
                          <span className="text-xs text-slate-600 font-mono">{pkg.ver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Installation Commands */}
              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Setup Commands</h3>
                <pre className="bg-slate-950 border border-white/10 rounded-xl p-5 text-sm font-mono space-y-3 overflow-x-auto">
                  <code className="text-slate-300">{`# Clone the repository
git clone https://github.com/your-repo/codecollab.git
cd codecollab

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# Start MongoDB (using Docker)
docker-compose up -d mongodb redis

# Start the development servers
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# Production build
cd client
npm run build
cd ../server
npm run build
npm start`}</code>
                </pre>
              </div>

              {/* MongoDB Schema */}
              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-400" />
                  MongoDB Schema Examples
                </h3>
                <pre className="bg-slate-950 border border-white/10 rounded-xl p-5 text-sm font-mono overflow-x-auto">
                  <code className="text-slate-300">{`// Room Schema
{
  _id: ObjectId,
  name: String,
  owner: { type: ObjectId, ref: 'User' },
  files: [{ type: ObjectId, ref: 'File' }],
  users: [{ type: ObjectId, ref: 'User' }],
  isPublic: Boolean,
  createdAt: Date
}

// File Schema
{
  _id: ObjectId,
  name: String,
  language: String,
  content: String,
  room: { type: ObjectId, ref: 'Room' },
  lastModifiedBy: { type: ObjectId, ref: 'User' },
  lastModifiedAt: Date,
  createdAt: Date
}

// User Schema
{
  _id: ObjectId,
  name: String,
  email: String,
  avatar: String,
  color: String,
  rooms: [{ type: ObjectId, ref: 'Room' }],
  createdAt: Date
}`}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
