import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Configuration CORS améliorée
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://localhost:5173",
    "https://charming-khapse-357d4e.netlify.app",
    "https://elaborate-tarsier-3c4796.netlify.app",
    "https://rainbow-sherbet-415bd2.netlify.app", // Votre nouveau déploiement
    /^https:\/\/.*\.netlify\.app$/,
    /^https:\/\/.*\.netlify\.com$/
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// Configuration Socket.IO avec debug amélioré
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'], // Ordre important : WebSocket en premier
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  // Ajout de logs pour debug
  serveClient: false,
  // Configuration spécifique pour Render
  allowUpgrades: true,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6
});

app.use(cors(corsOptions));
app.use(express.json());

// Middleware de debug pour toutes les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('Origin')}`);
  next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Route de santé améliorée
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    users: users.size,
    socketConnections: io.engine.clientsCount,
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: corsOptions.origin.length,
      methods: corsOptions.methods
    }
  };
  console.log('[HEALTH CHECK]', healthData);
  res.json(healthData);
});

// Route catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Stockage en mémoire avec debug
const rooms = new Map();
const users = new Map();
const gameStates = new Map();

// Fonctions utilitaires avec logs améliorés
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log(`[ROOM] Generated room code: ${result}`);
  return result;
}

function isUsernameAvailable(username, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return true;
  const available = !room.users.some(user => user.username === username);
  console.log(`[USER] Username "${username}" available in room ${roomCode}: ${available}`);
  return available;
}

function createRoom(roomCode) {
  console.log(`[ROOM] Creating room: ${roomCode}`);
  const room = {
    code: roomCode,
    users: [],
    messages: [],
    gameState: initializeGameState()
  };
  rooms.set(roomCode, room);
  gameStates.set(roomCode, room.gameState);
  console.log(`[ROOM] Room ${roomCode} created successfully`);
  return room;
}

function addUserToRoom(user, roomCode) {
  console.log(`[USER] Adding user ${user.username} to room ${roomCode}`);
  let room = rooms.get(roomCode);
  if (!room) {
    room = createRoom(roomCode);
  }
  
  if (!room.gameState) {
    console.log('[GAMESTATE] Missing gameState, reinitializing...');
    room.gameState = initializeGameState();
  }
  
  // Tous les nouveaux utilisateurs sont spectateurs
  user.team = 'spectator';
  user.role = 'spectator';
  
  // Ajouter aux spectateurs du gameState
  room.gameState.spectators.push({
    id: user.id,
    username: user.username,
    room: user.room,
    team: 'spectator',
    role: 'spectator'
  });
  
  room.users.push(user);
  const userWithTeam = { ...user, team: 'spectator', role: 'spectator' };
  users.set(user.id, userWithTeam);
  
  console.log(`[USER] User ${user.username} added successfully. Total users in room: ${room.users.length}`);
  console.log(`[GAMESTATE] Spectators count: ${room.gameState.spectators.length}`);
  
  return room;
}

function removeUserFromRoom(userId) {
  console.log(`[USER] Removing user ${userId}`);
  const user = users.get(userId);
  if (!user) {
    console.log(`[USER] User ${userId} not found`);
    return null;
  }
  
  const room = rooms.get(user.room);
  if (room) {
    room.users = room.users.filter(u => u.id !== userId);
    
    if (room.gameState) {
      // Retirer des spectateurs
      room.gameState.spectators = room.gameState.spectators.filter(u => u.id !== userId);
      
      // Retirer des équipes
      room.gameState.teams.red.disciples = room.gameState.teams.red.disciples.filter(u => u.id !== userId);
      room.gameState.teams.blue.disciples = room.gameState.teams.blue.disciples.filter(u => u.id !== userId);
      
      if (room.gameState.teams.red.sage?.id === userId) {
        room.gameState.teams.red.sage = null;
      }
      if (room.gameState.teams.blue.sage?.id === userId) {
        room.gameState.teams.blue.sage = null;
      }
    }
    
    console.log(`[USER] User ${user.username} removed. Remaining users: ${room.users.length}`);
    
    if (room.users.length === 0) {
      rooms.delete(user.room);
      gameStates.delete(user.room);
      console.log(`[ROOM] Room ${user.room} deleted (empty)`);
    }
  }
  
  users.delete(userId);
  return user;
}

function addMessageToRoom(roomCode, message) {
  const room = rooms.get(roomCode);
  if (room) {
    room.messages.push(message);
    console.log(`[MESSAGE] Added message to room ${roomCode}: ${message.message}`);
    return room;
  }
  console.log(`[MESSAGE] Failed to add message - room ${roomCode} not found`);
  return null;
}

function handleTeamJoin(userId, roomCode, team, role) {
  console.log(`[TEAM] User ${userId} joining team ${team} as ${role} in room ${roomCode}`);
  
  const room = rooms.get(roomCode);
  const user = users.get(userId);
  
  if (!room || !user || !room.gameState) {
    console.log(`[TEAM] Join failed - room: ${!!room}, user: ${!!user}, gameState: ${!!(room && room.gameState)}`);
    return { error: 'Données manquantes pour rejoindre l\'équipe' };
  }
  
  // Vérifier si le rôle de sage est déjà pris
  if (role === 'sage' && room.gameState.teams[team]?.sage) {
    console.log(`[TEAM] Sage role already taken for team ${team}`);
    return { error: 'Il y a déjà un Sage dans cette équipe !' };
  }
  
  console.log(`[TEAM] Removing user from current positions...`);
  // Retirer l'utilisateur de sa position actuelle
  room.gameState.spectators = room.gameState.spectators.filter(u => u.id !== userId);
  room.gameState.teams.red.disciples = room.gameState.teams.red.disciples.filter(u => u.id !== userId);
  room.gameState.teams.blue.disciples = room.gameState.teams.blue.disciples.filter(u => u.id !== userId);
  
  if (room.gameState.teams.red.sage?.id === userId) {
    room.gameState.teams.red.sage = null;
  }
  if (room.gameState.teams.blue.sage?.id === userId) {
    room.gameState.teams.blue.sage = null;
  }
  
  console.log(`[TEAM] Adding user to new position: ${team} ${role}`);
  // Ajouter à la nouvelle position
  const userWithTeam = { 
    id: user.id,
    username: user.username,
    room: user.room,
    team, 
    role 
  };
  
  if (team === 'spectator') {
    room.gameState.spectators.push(userWithTeam);
  } else if (role === 'sage') {
    room.gameState.teams[team].sage = userWithTeam;
  } else {
    room.gameState.teams[team].disciples.push(userWithTeam);
  }
  
  // Mettre à jour l'utilisateur
  users.set(userId, { ...user, team, role });
  const userIndex = room.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    room.users[userIndex] = { ...room.users[userIndex], team, role };
  }
  
  console.log(`[TEAM] User successfully joined team ${team} as ${role}`);
  return { success: true, gameState: room.gameState };
}

function initializeGameState() {
  console.log('[GAMESTATE] Initializing new game state');
  return {
    currentPhase: 0,
    phases: [
      "Attente début de la manche",
      "Phase 1 - Choix du mot", 
      "Phase 2 - Choix des mots interdits",
      "Phase 3 - Discours du Sage"
    ],
    teams: {
      red: { sage: null, disciples: [] },
      blue: { sage: null, disciples: [] }
    },
    spectators: [],
    timer: null,
    timeRemaining: 0,
    totalTime: 0,
    isPlaying: false,
    score: { red: 0, blue: 0 }
  };
}

// Configuration Socket.IO avec debug complet
io.on('connection', (socket) => {
  console.log(`[SOCKET] New connection: ${socket.id} from ${socket.handshake.address}`);
  console.log(`[SOCKET] Headers:`, socket.handshake.headers.origin);
  console.log(`[SOCKET] Transport:`, socket.conn.transport.name);
  
  // Debug: Écouter TOUS les événements entrants
  socket.onAny((eventName, ...args) => {
    console.log(`[EVENT IN] ${socket.id} -> ${eventName}:`, args);
  });
  
  // Debug: Écouter TOUS les événements sortants
  socket.onAnyOutgoing((eventName, ...args) => {
    console.log(`[EVENT OUT] ${socket.id} <- ${eventName}:`, args.length > 0 ? 'with data' : 'no data');
  });

  // Ping/Pong amélioré
  socket.on('ping', () => {
    console.log(`[PING] Received from ${socket.id}`);
    const response = {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      userExists: users.has(socket.id),
      userInfo: users.get(socket.id) || null,
      transport: socket.conn.transport.name,
      upgraded: socket.conn.upgraded
    };
    socket.emit('pong', response);
    console.log(`[PONG] Sent to ${socket.id}:`, response);
  });

  // Debug: Obtenir la liste des utilisateurs
  socket.on('debugGetUsers', () => {
    console.log(`[DEBUG] Users request from ${socket.id}`);
    const allUsers = Array.from(users.entries()).map(([id, user]) => ({
      id,
      username: user.username,
      room: user.room,
      team: user.team,
      role: user.role
    }));
    
    const allRooms = Array.from(rooms.entries()).map(([code, room]) => ({
      code,
      userCount: room.users.length,
      gameStateExists: !!room.gameState,
      spectatorCount: room.gameState?.spectators?.length || 0,
      redTeam: {
        sage: room.gameState?.teams?.red?.sage?.username || null,
        disciples: room.gameState?.teams?.red?.disciples?.length || 0
      },
      blueTeam: {
        sage: room.gameState?.teams?.blue?.sage?.username || null,
        disciples: room.gameState?.teams?.blue?.disciples?.length || 0
      }
    }));
    
    const debugData = {
      socketId: socket.id,
      userExists: users.has(socket.id),
      currentUser: users.get(socket.id) || null,
      allUsers,
      allRooms,
      totalUsers: users.size,
      totalRooms: rooms.size,
      transport: socket.conn.transport.name,
      upgraded: socket.conn.upgraded
    };
    
    socket.emit('debugUsersResponse', debugData);
    console.log(`[DEBUG] Response sent to ${socket.id}`);
  });

  // Créer un salon
  socket.on('createRoom', (username) => {
    console.log(`[CREATE ROOM] Request from ${socket.id} with username: ${username}`);
    
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (rooms.has(roomCode));

    if (!isUsernameAvailable(username, roomCode)) {
      console.log(`[CREATE ROOM] Username ${username} taken in room ${roomCode}`);
      socket.emit('usernameTaken');
      return;
    }

    const user = {
      id: socket.id,
      username,
      room: roomCode
    };

    socket.join(roomCode);
    console.log(`[SOCKET] ${socket.id} joined room ${roomCode}`);
    
    const room = addUserToRoom(user, roomCode);
    
    console.log(`[CREATE ROOM] Success - ${username} created and joined room ${roomCode}`);
    
    socket.emit('roomJoined', room);
    
    // Envoyer le gameState avec un délai pour s'assurer que le client est prêt
    setTimeout(() => {
      console.log(`[GAMESTATE] Sending initial gameState to ${socket.id}`);
      socket.emit('gameStateUpdate', room.gameState);
      io.to(roomCode).emit('gameStateUpdate', room.gameState);
    }, 100);
    
    socket.to(roomCode).emit('userJoined', user);
    io.to(roomCode).emit('usersUpdate', room.users);
  });

  // Rejoindre un salon
  socket.on('joinRoom', (username, roomCode) => {
    console.log(`[JOIN ROOM] Request from ${socket.id} - username: ${username}, room: ${roomCode}`);
    
    const room = rooms.get(roomCode);
    
    if (!room) {
      console.log(`[JOIN ROOM] Room ${roomCode} not found`);
      socket.emit('roomNotFound');
      return;
    }

    if (!isUsernameAvailable(username, roomCode)) {
      console.log(`[JOIN ROOM] Username ${username} taken in room ${roomCode}`);
      socket.emit('usernameTaken');
      return;
    }

    const user = {
      id: socket.id,
      username,
      room: roomCode
    };

    socket.join(roomCode);
    console.log(`[SOCKET] ${socket.id} joined room ${roomCode}`);
    
    addUserToRoom(user, roomCode);
    
    console.log(`[JOIN ROOM] Success - ${username} joined room ${roomCode}`);
    
    socket.emit('roomJoined', room);
    
    // Envoyer le gameState avec un délai
    setTimeout(() => {
      console.log(`[GAMESTATE] Sending gameState to ${socket.id}`);
      socket.emit('gameStateUpdate', room.gameState);
      io.to(roomCode).emit('gameStateUpdate', room.gameState);
    }, 100);
    
    socket.to(roomCode).emit('userJoined', user);
    io.to(roomCode).emit('usersUpdate', room.users);
  });

  // Rejoindre une équipe - ÉVÉNEMENT CRITIQUE
  socket.on('joinTeam', (team, role) => {
    console.log(`[JOIN TEAM] *** CRITICAL EVENT *** Socket ${socket.id} wants to join team ${team} as ${role}`);
    
    const user = users.get(socket.id);
    if (!user) {
      console.log(`[JOIN TEAM] ERROR - User not found for socket ${socket.id}`);
      console.log(`[JOIN TEAM] Available users:`, Array.from(users.keys()));
      socket.emit('teamJoinError', 'Utilisateur non trouvé');
      return;
    }
    
    console.log(`[JOIN TEAM] User found: ${user.username} in room ${user.room}`);
    
    const result = handleTeamJoin(socket.id, user.room, team, role);
    
    if (result?.error) {
      console.log(`[JOIN TEAM] Error: ${result.error}`);
      socket.emit('teamJoinError', result.error);
      return;
    }
    
    if (result?.success) {
      console.log(`[JOIN TEAM] Success for ${user.username}`);
      const teamName = team === 'red' ? 'Rouge' : team === 'blue' ? 'Bleue' : 'Spectateurs';
      const roleName = role === 'sage' ? 'Sage' : role === 'disciple' ? 'Disciple' : 'Spectateur';
      
      // Message système
      const message = {
        id: Date.now().toString(),
        username: 'Système',
        message: `${user.username} est devenu ${roleName} ${team !== 'spectator' ? `de l'équipe ${teamName}` : ''}`,
        timestamp: new Date()
      };
      
      const room = rooms.get(user.room);
      if (room) {
        addMessageToRoom(user.room, message);
        console.log(`[JOIN TEAM] Broadcasting updates to room ${user.room}`);
        
        // Diffuser à tous
        io.to(user.room).emit('newMessage', message);
        io.to(user.room).emit('gameStateUpdate', result.gameState);
        io.to(user.room).emit('usersUpdate', room.users);
        
        // Confirmation à l'utilisateur
        socket.emit('teamJoinSuccess', { team, role, gameState: result.gameState });
        console.log(`[JOIN TEAM] All updates sent successfully`);
      } else {
        console.log(`[JOIN TEAM] ERROR - Room not found when broadcasting`);
      }
    } else {
      console.log(`[JOIN TEAM] Unknown error:`, result);
      socket.emit('teamJoinError', 'Erreur inconnue lors du changement d\'équipe');
    }
  });

  // Démarrer le jeu
  socket.on('startGame', () => {
    console.log(`[GAME] Start game request from ${socket.id}`);
    const user = users.get(socket.id);
    if (!user) return;
    
    const room = rooms.get(user.room);
    if (!room || !room.gameState) return;
    
    // Vérifier si l'utilisateur est le créateur
    const creator = room.users[0];
    if (user.id !== creator?.id) {
      console.log(`[GAME] Start denied - ${user.username} is not creator`);
      socket.emit('gameError', 'Seul le créateur peut démarrer la partie');
      return;
    }
    
    if (room.gameState.currentPhase === 0) {
      room.gameState.currentPhase = 1;
      room.gameState.isPlaying = true;
      room.gameState.timeRemaining = 30;
      room.gameState.totalTime = 30;
      
      console.log(`[GAME] Game started in room ${user.room}`);
      io.to(user.room).emit('gameStateUpdate', room.gameState);
    }
  });

  // Mettre en pause le jeu
  socket.on('pauseGame', () => {
    console.log(`[GAME] Pause game request from ${socket.id}`);
    const user = users.get(socket.id);
    if (!user) return;
    
    const room = rooms.get(user.room);
    if (!room || !room.gameState) return;
    
    // Vérifier si l'utilisateur est le créateur
    const creator = room.users[0];
    if (user.id !== creator?.id) {
      console.log(`[GAME] Pause denied - ${user.username} is not creator`);
      socket.emit('gameError', 'Seul le créateur peut mettre en pause la partie');
      return;
    }
    
    room.gameState.isPlaying = false;
    console.log(`[GAME] Game paused in room ${user.room}`);
    io.to(user.room).emit('gameStateUpdate', room.gameState);
  });

  // Envoyer un message
  socket.on('sendMessage', (messageText) => {
    console.log(`[MESSAGE] From ${socket.id}: ${messageText}`);
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: Date.now().toString(),
      username: user.username,
      message: messageText,
      timestamp: new Date()
    };

    addMessageToRoom(user.room, message);
    io.to(user.room).emit('newMessage', message);
  });

  // Gestion des transports
  socket.conn.on('upgrade', () => {
    console.log(`[TRANSPORT] ${socket.id} upgraded to ${socket.conn.transport.name}`);
  });

  socket.conn.on('upgradeError', (err) => {
    console.log(`[TRANSPORT] ${socket.id} upgrade error:`, err);
  });

  // Déconnexion
  socket.on('disconnect', (reason) => {
    console.log(`[SOCKET] Disconnection: ${socket.id} - Reason: ${reason}`);
    const user = removeUserFromRoom(socket.id);
    if (user) {
      socket.to(user.room).emit('userLeft', socket.id);
      
      const room = rooms.get(user.room);
      if (room) {
        io.to(user.room).emit('gameStateUpdate', room.gameState);
        io.to(user.room).emit('usersUpdate', room.users);
      }
      
      console.log(`[SOCKET] ${user.username} left room ${user.room}`);
    }
  });

  // Gestion des erreurs
  socket.on('error', (error) => {
    console.error(`[SOCKET ERROR] ${socket.id}:`, error);
  });
});

// Gestion des erreurs du serveur Socket.IO
io.engine.on('connection_error', (err) => {
  console.error('[ENGINE ERROR]', {
    req: err.req?.url,
    code: err.code,
    message: err.message,
    context: err.context
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] Started on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] CORS origins:`, corsOptions.origin.length);
});