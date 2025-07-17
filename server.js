import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//Bonjour
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://localhost:5173",
      "https://kenshou.netlify.app",
      "https://kensho-hab0.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// log
io.on('connection', (socket) => {
  console.log(`🔌 Nouvelle connexion: socket id = ${socket.id}`);

  socket.on('joinRoom', (username, roomCode) => {
    console.log(`[joinRoom] Reçu de socket ${socket.id} - username: ${username}, roomCode: ${roomCode}`);

    // Exemple de gestion, à adapter à ta logique métier
    if (!rooms.has(roomCode)) {
      console.log(`[joinRoom] La salle ${roomCode} n'existe pas.`);
      socket.emit('error', 'Room not found');
      return;
    }

    socket.join(roomCode);
    console.log(`[joinRoom] Socket ${socket.id} a rejoint la salle ${roomCode}`);
  });

  socket.on('joinTeam', (teamName, role) => {
    console.log(`[joinTeam] Reçu de socket ${socket.id} - team: ${teamName}, role: ${role}`);

    // Exemple simple de validation (à adapter)
    if (!teamName || !role) {
      console.log(`[joinTeam] Données invalides de la part de ${socket.id}`);
      socket.emit('error', 'Invalid team or role');
      return;
    }

    // Logique métier ici...

    console.log(`[joinTeam] Socket ${socket.id} a demandé à rejoindre l'équipe ${teamName} avec le rôle ${role}`);
  });

  // Log tous les événements reçus (utile pour debug)
  socket.onAny((event, ...args) => {
    console.log(`⚡ Event reçu: ${event} | Arguments:`, args);
  });

  socket.on('disconnect', (reason) => {
    console.log(`❌ Déconnexion socket ${socket.id} - Raison: ${reason}`);
  });
});


app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, 'dist')));

// Route de santé pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    users: users.size
  });
});

// Route catch-all pour servir l'application React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Stockage en mémoire
const rooms = new Map();
const users = new Map();

// Structure pour stocker l'état du jeu par salon
const gameStates = new Map();

// Génère un code de salon aléatoire
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// chat add function gameParameters
function getDefaultParameters() {
  return {
    ParametersTimeFirst: 20,
    ParametersTimeSecond: 90,
    ParametersTimeThird: 120,
    ParametersTeamReroll: 2,
    ParametersTeamMaxForbiddenWords: 6,
    ParametersTeamMaxPropositions: 5,
    ParametersPointsMaxScore: 3,
    ParametersPointsRules: 'no-tie',
    ParametersWordsListSelection: {
      veryCommon: true,
      lessCommon: true,
      rarelyCommon: false
    }
  };
}
// Vérifie si un nom d'utilisateur est disponible dans un salon
function isUsernameAvailable(username, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return true;
  return !room.users.some(user => user.username === username);
}
// chat way
function createRoom(roomCode, gameParameters = getDefaultGameParameters()) {
  const room = {
    code: roomCode,
    users: [],
    messages: [],
    gameParameters,
    gameState: initializeGameState(gameParameters)
  };
  rooms.set(roomCode, room);
  gameStates.set(roomCode, room.gameState);
  return room;
}

// bolt way
// Crée un nouveau salon
// function createRoom(roomCode) {
//   const room = {
//     code: roomCode,
//     users: [],
//     messages: [],
//     gameState: initializeGameState()
//   };
//   rooms.set(roomCode, room);
//   gameStates.set(roomCode, room.gameState);
//   return room;
// }
//chat way
function addUserToRoom(user, roomCode, gameParameters) {
  if (!gameParameters) {
    gameParameters = {
      ParametersTimeFirst: 20,
      ParametersTimeSecond: 90,
      ParametersTimeThird: 120,
      ParametersTeamReroll: 2,
      ParametersTeamMaxForbiddenWords: 6,
      ParametersTeamMaxPropositions: 5,
      ParametersPointsMaxScore: 3,
      ParametersPointsRules: 'no-tie',
      ParametersWordsListSelection: {
        veryCommon: true,
        lessCommon: true,
        rarelyCommon: false
      }
    };
  }

  let room = rooms.get(roomCode);
  //chat way
    if (!room) {
    room = createRoom(roomCode, gameParameters);
  }
  //bolt way 
  // if (!room) {
  //   room = createRoom(roomCode);
  // }
  
  // S'assurer que le gameState existe
  if (!room.gameState) {
    console.log('GameState missing, reinitializing...');
    room.gameState = initializeGameState();
  }
  
  // Tous les nouveaux utilisateurs sont automatiquement spectateurs
  user.team = 'spectator';
  user.role = 'spectator';
  
  // Ajouter l'utilisateur aux spectateurs du gameState
  room.gameState.spectators.push({
    id: user.id,
    username: user.username,
    room: user.room,
    team: 'spectator',
    role: 'spectator'
  });
  
  room.users.push(user);
  // S'assurer que l'utilisateur est bien enregistré dans la Map users avec toutes les propriétés
  const userWithTeam = { ...user, team: 'spectator', role: 'spectator' };
  users.set(user.id, userWithTeam);
  console.log(`User ${user.username} added to room ${roomCode}`);
  console.log(`User ${user.username} registered in users Map with ID: ${user.id}`);
  console.log('User object in Map:', users.get(user.id));
  return room;
}

// bolt way
// Ajoute un utilisateur à un salon
// function addUserToRoom(user, roomCode) {
//   let room = rooms.get(roomCode);
//   if (!room) {
//     room = createRoom(roomCode);
//   }
  
//   // S'assurer que le gameState existe
//   if (!room.gameState) {
//     console.log('GameState missing, reinitializing...');
//     room.gameState = initializeGameState();
//   }
  
//   // Tous les nouveaux utilisateurs sont automatiquement spectateurs
//   user.team = 'spectator';
//   user.role = 'spectator';
  
//   // Ajouter l'utilisateur aux spectateurs du gameState
//   room.gameState.spectators.push({
//     id: user.id,
//     username: user.username,
//     room: user.room,
//     team: 'spectator',
//     role: 'spectator'
//   });
  
//   room.users.push(user);
//   // S'assurer que l'utilisateur est bien enregistré dans la Map users avec toutes les propriétés
//   const userWithTeam = { ...user, team: 'spectator', role: 'spectator' };
//   users.set(user.id, userWithTeam);
//   console.log(`User ${user.username} added to room ${roomCode}`);
//   console.log(`User ${user.username} registered in users Map with ID: ${user.id}`);
//   console.log('User object in Map:', users.get(user.id));
//   return room;
// }

// Supprime un utilisateur d'un salon
function removeUserFromRoom(userId) {
  const user = users.get(userId);
  if (!user) return null;
  
  const room = rooms.get(user.room);
  if (room) {
    room.users = room.users.filter(u => u.id !== userId);
    
    // Retirer l'utilisateur du gameState
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
    
    // Supprime le salon s'il est vide
    if (room.users.length === 0) {
      rooms.delete(user.room);
      gameStates.delete(user.room);
    }
  }
  
  users.delete(userId);
  return user;
}

// Ajoute un message à un salon
function addMessageToRoom(roomCode, message) {
  const room = rooms.get(roomCode);
  if (room) {
    room.messages.push(message);
    return room;
  }
  return null;
}

// Fonction pour gérer les changements d'équipe
function handleTeamJoin(userId, roomCode, team, role) {
  const room = rooms.get(roomCode);
  const user = users.get(userId);
  
  console.log('=== HANDLE TEAM JOIN DEBUG ===');
  console.log('userId:', userId);
  console.log('roomCode:', roomCode);
  console.log('team:', team);
  console.log('role:', role);
  console.log('room found:', !!room);
  console.log('user found:', !!user);
  console.log('room.gameState exists:', !!(room && room.gameState));
  
  if (!room || !user || !room.gameState) return null;
  
  console.log(`User ${user.username} joining team ${team} as ${role}`);
  console.log('Current gameState teams:', JSON.stringify(room.gameState.teams, null, 2));
  console.log('Current gameState spectators:', JSON.stringify(room.gameState.spectators, null, 2));
  
  // Vérifier si le rôle de sage est déjà pris
  if (role === 'sage' && room.gameState.teams[team].sage) {
    console.log('Sage role already taken for team:', team);
    return { error: 'Il y a déjà un Sage dans cette équipe !' };
  }
  
  console.log('Removing user from current positions...');
  // Retirer l'utilisateur de sa position actuelle
  room.gameState.spectators = room.gameState.spectators.filter(u => u.id !== userId);
  room.gameState.teams.red.disciples = room.gameState.teams.red.disciples.filter(u => u.id !== userId);
  room.gameState.teams.blue.disciples = room.gameState.teams.blue.disciples.filter(u => u.id !== userId);
  
  if (room.gameState.teams.red.sage?.id === userId) {
    console.log('Removing user from red sage position');
    room.gameState.teams.red.sage = null;
  }
  if (room.gameState.teams.blue.sage?.id === userId) {
    console.log('Removing user from blue sage position');
    room.gameState.teams.blue.sage = null;
  }
  
  console.log('Adding user to new position...');
  // Ajouter à la nouvelle position
  const userWithTeam = { 
    id: user.id,
    username: user.username,
    room: user.room,
    team, 
    role 
  };
  
  if (team === 'spectator') {
    console.log('Adding to spectators');
    room.gameState.spectators.push(userWithTeam);
  } else if (role === 'sage') {
    console.log(`Adding as sage to team ${team}`);
    room.gameState.teams[team].sage = userWithTeam;
  } else {
    console.log(`Adding as disciple to team ${team}`);
    room.gameState.teams[team].disciples.push(userWithTeam);
  }
  
  // Mettre à jour l'utilisateur dans la base
  users.set(userId, { ...user, team, role });
  
  // Mettre à jour l'utilisateur dans la liste des utilisateurs de la room
  const userIndex = room.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    console.log('Updating user in room.users');
    room.users[userIndex] = { ...room.users[userIndex], team, role };
  }
  
  console.log('Updated gameState teams:', JSON.stringify(room.gameState.teams, null, 2));
  console.log('Updated gameState spectators:', JSON.stringify(room.gameState.spectators, null, 2));
  console.log('=== END HANDLE TEAM JOIN DEBUG ===');
  return { success: true, gameState: room.gameState };
}

// Fonction pour initialiser le gameState d'une room
function initializeGameState() {
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

io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);

  // Ping/Pong pour tester la connexion
  // socket.on('ping', () => {
  //   console.log(`Ping reçu de ${socket.id}`);
  //   socket.emit('pong', {
  //     timestamp: new Date().toISOString(),
  //     socketId: socket.id,
  //     userExists: users.has(socket.id),
  //     userInfo: users.get(socket.id) || null
  //   });
  // });

  // Debug: Obtenir la liste des utilisateurs
  socket.on('debugGetUsers', () => {
    console.log(`Debug users request from ${socket.id}`);
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
    
    socket.emit('debugUsersResponse', {
      socketId: socket.id,
      userExists: users.has(socket.id),
      currentUser: users.get(socket.id) || null,
      allUsers,
      allRooms,
      totalUsers: users.size,
      totalRooms: rooms.size
    });
  });
    
  
    //créer un salon chat
    socket.on('createRoom', (data) => {
    const { username, gameMode, parameters } = data;
    
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (rooms.has(roomCode));

    if (!isUsernameAvailable(username, roomCode)) {
      socket.emit('usernameTaken');
      return;
    }

    //chat rajout pour gameParams
    if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      code: roomCode,
      users: [],
      gameState: {},
      gameMode: gameMode || 'standard',
      parameters: parameters || getDefaultParameters(), // fonction à définir
      // autres propriétés si besoin
    });
  } 
  //toujours chat
    const room = rooms.get(roomCode);

  //de base bolt
    const user = {
      id: socket.id,
      username,
      room: roomCode
    };
    //chat
    room.users.push(user);

    socket.join(roomCode);
    //bolt way
    //const room = addUserToRoom(user, roomCode);
    
    console.log(`${username} a créé et rejoint le salon ${roomCode}`);
    console.log('Current users in room:', room.users);
    
    //ancien bolt
    //console.log('User after addUserToRoom:', users.get(socket.id));
    //console.log('Current users in Map after create:', Array.from(users.entries()).map(([id, u]) => ({ id, username: u.username, room: u.room, team: u.team, role: u.role })));
    console.log('ROOM DATA SENT TO CLIENT:', room);
    socket.emit('roomJoined', room);
    // Envoyer le gameState après un court délai pour s'assurer que le client est prêt
    setTimeout(() => {
      socket.emit('gameStateUpdate', room.gameState);
      io.to(roomCode).emit('gameStateUpdate', room.gameState);
    }, 100);
    socket.to(roomCode).emit('userJoined', user);
    io.to(roomCode).emit('usersUpdate', room.users);
  });


  // Créer un salon bolt
  // socket.on('createRoom', (username) => {
  //   let roomCode;
  //   do {
  //     roomCode = generateRoomCode();
  //   } while (rooms.has(roomCode));

  //   if (!isUsernameAvailable(username, roomCode)) {
  //     socket.emit('usernameTaken');
  //     return;
  //   }

  //   const user = {
  //     id: socket.id,
  //     username,
  //     room: roomCode
  //   };

  //   socket.join(roomCode);
    
  //   const room = addUserToRoom(user, roomCode);
    
  //   console.log(`${username} a créé et rejoint le salon ${roomCode}`);
  //   console.log('User after addUserToRoom:', users.get(socket.id));
  //   console.log('Current users in Map after create:', Array.from(users.entries()).map(([id, u]) => ({ id, username: u.username, room: u.room, team: u.team, role: u.role })));
    
  //   socket.emit('roomJoined', room);
  //   // Envoyer le gameState après un court délai pour s'assurer que le client est prêt
  //   setTimeout(() => {
  //     socket.emit('gameStateUpdate', room.gameState);
  //     io.to(roomCode).emit('gameStateUpdate', room.gameState);
  //   }, 100);
  //   socket.to(roomCode).emit('userJoined', user);
  //   io.to(roomCode).emit('usersUpdate', room.users);
  // });

  // Rejoindre un salon
  socket.on('joinRoom', (username, roomCode) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('roomNotFound');
      return;
    }

    if (!isUsernameAvailable(username, roomCode)) {
      socket.emit('usernameTaken');
      return;
    }

    const user = {
      id: socket.id,
      username,
      room: roomCode
    };

    socket.join(roomCode);
    
    addUserToRoom(user, roomCode);
    
    console.log(`${username} a rejoint le salon ${roomCode}`);
    console.log('User after addUserToRoom:', users.get(socket.id));
    console.log('Current users in Map after join:', Array.from(users.entries()).map(([id, u]) => ({ id, username: u.username, room: u.room, team: u.team, role: u.role })));
    
    socket.emit('roomJoined', room);
    // Envoyer le gameState après un court délai pour s'assurer que le client est prêt
    setTimeout(() => {
      socket.emit('gameStateUpdate', room.gameState);
      io.to(roomCode).emit('gameStateUpdate', room.gameState);
    }, 100);
    socket.to(roomCode).emit('userJoined', user);
    io.to(roomCode).emit('usersUpdate', room.users);
  });

  // Rejoindre une équipe
  socket.on('joinTeam', (team, role) => {
    console.log(`=== JOIN TEAM EVENT ===`);
    console.log(`Socket ${socket.id} wants to join team ${team} as ${role}`);
    console.log('All users in Map:', Array.from(users.entries()).map(([id, user]) => ({ id, username: user.username, room: user.room })));
    const user = users.get(socket.id);
    if (!user) {
      console.log('User not found for socket:', socket.id);
      console.log('Available users:', Array.from(users.keys()));
      console.log('Socket rooms:', Array.from(socket.rooms));
      socket.emit('teamJoinError', 'Utilisateur non trouvé');
      return;
    }
    
    console.log('User found:', user);
    console.log('User room:', user.room);
    
    console.log(`User ${user.username} attempting to join team ${team} as ${role}`);
    
    const result = handleTeamJoin(socket.id, user.room, team, role);
    
    if (result?.error) {
      console.log('Team join error:', result.error);
      socket.emit('teamJoinError', result.error);
      return;
    }
    
    if (result?.success) {
      console.log('Team join successful, sending updates...');
      const teamName = team === 'red' ? 'Rouge' : team === 'blue' ? 'Bleue' : 'Spectateurs';
      const roleName = role === 'sage' ? 'Sage' : role === 'disciple' ? 'Disciple' : 'Spectateur';
      
      // Envoyer un message dans l'historique
      const message = {
        id: Date.now().toString(),
        username: 'Système',
        message: `${user.username} est devenu ${roleName} ${team !== 'spectator' ? `de l'équipe ${teamName}` : ''}`,
        timestamp: new Date()
      };
      
      const room = rooms.get(user.room);
      if (room) {
        addMessageToRoom(user.room, message);
        console.log('Broadcasting updates to room:', user.room);
        // Diffuser à tous les utilisateurs de la room
        io.to(user.room).emit('newMessage', message);
        io.to(user.room).emit('gameStateUpdate', result.gameState);
        io.to(user.room).emit('usersUpdate', room.users);
        // Envoyer la confirmation à l'utilisateur qui a changé d'équipe
        socket.emit('teamJoinSuccess', { team, role, gameState: result.gameState });
        console.log('Team join successful for user:', user.username);
      } else {
        console.log('Room not found when trying to broadcast updates');
      }
    } else {
      console.log('Team join failed for unknown reason');
      console.log('Result:', result);
      socket.emit('teamJoinError', 'Erreur inconnue lors du changement d\'équipe');
    }
    console.log('=== END JOIN TEAM EVENT ===');
  });

  // Démarrer le jeu
  socket.on('startGame', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    const room = rooms.get(user.room);
    if (!room || !room.gameState) return;
    
    // Tout le monde peut démarrer la partie maintenant
    
    if (room.gameState.currentPhase === 0) {
      room.gameState.currentPhase = 1;
      room.gameState.isPlaying = true;
      room.gameState.timeRemaining = 30;
      room.gameState.totalTime = 30;
      
      io.to(user.room).emit('gameStateUpdate', room.gameState);
    }
  });

  // Mettre en pause le jeu
  socket.on('pauseGame', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    const room = rooms.get(user.room);
    if (!room || !room.gameState) return;
    
    // Tout le monde peut mettre en pause la partie maintenant
    
    room.gameState.isPlaying = false;
    io.to(user.room).emit('gameStateUpdate', room.gameState);
  });

  // Envoyer un message
  socket.on('sendMessage', (messageText) => {
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
    
    console.log(`Message de ${user.username} dans ${user.room}: ${messageText}`);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const user = removeUserFromRoom(socket.id);
    if (user) {
      socket.to(user.room).emit('userLeft', socket.id);
      
      const room = rooms.get(user.room);
      if (room) {
        io.to(user.room).emit('gameStateUpdate', room.gameState);
        io.to(user.room).emit('usersUpdate', room.users);
      }
      
      console.log(`${user.username} a quitté le salon ${user.room}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});