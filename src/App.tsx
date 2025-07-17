import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Home from './components/Home';
import Room from './components/Room';
import DemoMode from './components/DemoMode';
import KeepAlive from './components/KeepAlive';
import SocketDebugger from './components/SocketDebugger';
import GameConfigModal from './components/GameConfigModal';
import { Room as RoomType, User, Message, ServerToClientEvents, ClientToServerEvents, GameParameters } from './types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

const App: React.FC = () => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showGameConfig, setShowGameConfig] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  // Configuration du serveur Socket.IO
  const SERVER_URL = import.meta.env.PROD 
    ? 'https://chatrooms-server.onrender.com'
    : 'https://chatrooms-server.onrender.com';

  useEffect(() => {
    // Fonction pour réveiller le serveur
    const wakeUpServer = async () => {
      try {
        console.log('Attempting to wake up server...');
        setError('Réveil du serveur en cours... (30-60 secondes)');
        
        const response = await fetch(`${SERVER_URL}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('Server is awake');
          setError(null);
          return true;
        }
      } catch (error) {
        console.log('Server wake up failed:', error);
        return false;
      }
      return false;
    };

    // Essayer de réveiller le serveur avant de se connecter
    const initializeConnection = async () => {
      setIsConnecting(true);
      
      // Essayer de réveiller le serveur d'abord
      await wakeUpServer();
      
      // Attendre un peu pour que le serveur soit complètement prêt
      setTimeout(() => {
        createSocketConnection();
      }, 2000);
    };

    const createSocketConnection = () => {
    const newSocket: SocketType = io(SERVER_URL, {
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'], // WebSocket en premier
      forceNew: true,
      upgrade: true,
      rememberUpgrade: true,
      autoConnect: true,
      // Configuration spécifique pour la production
      ...(import.meta.env.PROD && {
        transports: ['polling', 'websocket'], // Polling en premier en production
        upgrade: true,
        rememberUpgrade: true
      })
    });

    // Debug: Écouter tous les événements
    newSocket.onAny((eventName, ...args) => {
      console.log(`[CLIENT EVENT IN] ${eventName}:`, args);
    });

    // Intercepter les émissions pour debug
    const originalEmit = newSocket.emit.bind(newSocket);
    newSocket.emit = function(eventName: string, ...args: any[]) {
      console.log(`[CLIENT EVENT OUT] ${eventName}:`, args);
      return originalEmit(eventName, ...args);
    };

    newSocket.on('connect', () => {
      console.log('Connecté au serveur');
      console.log('Transport:', newSocket.io.engine.transport.name);
      console.log('Socket ID:', newSocket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      
      // Si on était dans une room, essayer de la rejoindre
      if (currentUser && currentRoom) {
        console.log('Reconnecting to room after server wake up...');
        setTimeout(() => {
          newSocket.emit('joinRoom', currentUser.username, currentRoom.code);
        }, 1000);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté du serveur');
      setIsConnected(false);
      setError('Connexion perdue - Reconnexion en cours...');
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnecté après', attemptNumber, 'tentatives');
      setIsConnected(true);
      setError(null);
    });
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Tentative de reconnexion', attemptNumber);
      setError(`Reconnexion en cours... (tentative ${attemptNumber})`);
    });
    
    newSocket.on('reconnect_failed', () => {
      console.log('Échec de la reconnexion');
      setError('Impossible de se reconnecter au serveur. Le serveur est peut-être en veille.');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erreur de connexion:', error);
      setIsConnecting(false);
      setError('Serveur en veille - Réveil en cours... Cela peut prendre 30-60 secondes.');
      
      // Essayer de réveiller le serveur en cas d'erreur de connexion
      setTimeout(async () => {
        const serverAwake = await wakeUpServer();
        if (serverAwake) {
          // Réessayer la connexion après réveil
          setTimeout(() => {
            newSocket.connect();
          }, 3000);
        }
      }, 5000);
    });

    newSocket.on('roomJoined', (room: RoomType) => {
      console.log('Salon rejoint:', room);
      setCurrentRoom(room);
      // S'assurer que le gameState est initialisé
      if (!room.gameState) {
        room.gameState = {
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
          spectators: room.users.map(user => ({ ...user, team: 'spectator', role: 'spectator' })),
          timer: null,
          timeRemaining: 0,
          totalTime: 0,
          isPlaying: false,
          score: { red: 0, blue: 0 }
        };
      }
      setError(null);
    });

    newSocket.on('userJoined', (user: User) => {
      console.log('Utilisateur rejoint:', user);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: [...prev.users, user]
        };
      });
    });

    newSocket.on('userLeft', (userId: string) => {
      console.log('Utilisateur parti:', userId);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.filter(user => user.id !== userId)
        };
      });
    });

    newSocket.on('usersUpdate', (users: User[]) => {
      console.log('Mise à jour des utilisateurs:', users);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users
        };
      });
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('Nouveau message:', message);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, message]
        };
      });
    });

    newSocket.on('teamJoinSuccess', (data: { team: string; role: string; gameState: GameState }) => {
      console.log('Team join success:', data);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          gameState: data.gameState
        };
      });
    });

    newSocket.on('teamJoinError', (error: string) => {
      console.log('Team join error:', error);
      setError(error);
      setTimeout(() => setError(null), 3000);
    });

    newSocket.on('roomNotFound', () => {
      setError('Salon non trouvé. Vérifiez le code et réessayez.');
    });

    newSocket.on('usernameTaken', () => {
      setError('Ce pseudo est déjà utilisé dans ce salon. Choisissez-en un autre.');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
    };

    // Démarrer le processus d'initialisation
    initializeConnection();
  }, []);

  const handleCreateRoom = (username: string) => {
    if (!socket || !isConnected) {
      setError('Connexion au serveur en cours. Veuillez patienter.');
      return;
    }
    
    // Stocker le nom d'utilisateur et ouvrir la modal de configuration
    setPendingUsername(username);
    setShowGameConfig(true);
  };

  const handleGameConfigConfirm = (parameters: GameParameters) => {
    if (socket && isConnected && pendingUsername) {
      setCurrentUser({
        id: socket.id || '',
        username: pendingUsername,
        room: '',
        roomRole: 'Admin' // Le créateur est automatiquement Admin
      });
      
      // Émettre la création de salon avec les paramètres
      socket.emit('createRoom', pendingUsername);
      socket.emit('setGameParameters', parameters);
      
      setError(null);
      setPendingUsername(null);
      setShowGameConfig(false);
    }
  };

  const handleGameConfigCancel = () => {
    setPendingUsername(null);
    setShowGameConfig(false);
  };

  const handleJoinRoom = (username: string, roomCode: string) => {
    if (socket && isConnected) {
      setCurrentUser({
        id: socket.id || '',
        username,
        room: roomCode,
        roomRole: 'Débutant' // Les nouveaux joueurs sont Débutants par défaut
      });
      socket.emit('joinRoom', username, roomCode);
      setError(null);
    } else {
      setError('Connexion au serveur en cours. Veuillez patienter.');
    }
  };

  const handleSendMessage = (message: string) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', message);
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    setCurrentUser(null);
    setCurrentRoom(null);
    setError(null);
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
  };

  // Mode démo
  if (isDemoMode) {
    return <DemoMode />;
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Connexion au serveur Kensho.
          </h2>
          <p className="text-gray-600 mb-4">
            Établissement de la connexion...
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Connexion échouée
          </h2>
          <p className="text-gray-600 mb-6">
            Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (currentRoom && currentUser) {
    return (
      <>
        <Room
          room={currentRoom}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onLeaveRoom={handleLeaveRoom}
          socket={socket}
        />
        <SocketDebugger socket={socket} isConnected={isConnected} />
      </>
    );
  }

  return (
    <>
      <KeepAlive serverUrl={SERVER_URL} />
      <SocketDebugger socket={socket} isConnected={isConnected} />
      <Home
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onDemoMode={handleDemoMode}
        error={error}
        isConnected={isConnected}
      />
      
      <GameConfigModal
        isOpen={showGameConfig}
        onClose={handleGameConfigCancel}
        onConfirm={handleGameConfigConfirm}
      />
    </>
  );
};

export default App;