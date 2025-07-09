import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import Home from './components/Home';
import Room from './components/Room';
import { Room as RoomType, User, Message } from './types';

// Détecte si on est en production (Netlify)
const isProduction = window.location.hostname !== 'localhost';
const SOCKET_URL = isProduction ? 'https://YOUR_RENDER_URL.onrender.com' : 'http://localhost:3001';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const socket = useSocket(SOCKET_URL);

  useEffect(() => {
    if (demoMode) {
      setIsConnected(true);
      return;
    }

    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connecté au serveur');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Déconnecté du serveur');
    });

    socket.on('roomJoined', (room: RoomType) => {
      setCurrentRoom(room);
      setError(null);
      console.log('Salon rejoint:', room.code);
    });

    socket.on('userJoined', (user: User) => {
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: [...prev.users, user]
        };
      });
      console.log('Utilisateur rejoint:', user.username);
    });

    socket.on('userLeft', (userId: string) => {
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.filter(u => u.id !== userId)
        };
      });
    });

    socket.on('usersUpdate', (users: User[]) => {
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users
        };
      });
    });

    socket.on('newMessage', (message: Message) => {
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, message]
        };
      });
    });

    socket.on('roomNotFound', () => {
      setError('Salon non trouvé. Vérifiez le code et réessayez.');
    });

    socket.on('usernameTaken', () => {
      setError('Ce pseudo est déjà pris dans ce salon. Choisissez-en un autre.');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomJoined');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('usersUpdate');
      socket.off('newMessage');
      socket.off('roomNotFound');
      socket.off('usernameTaken');
    };
  }, [socket, demoMode]);

  const handleCreateRoom = (username: string) => {
    if (demoMode) {
      // Mode démo : créer un salon fictif
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const user: User = {
        id: 'demo-user',
        username,
        room: roomCode
      };
      const room: RoomType = {
        code: roomCode,
        users: [user],
        messages: [
          {
            id: '1',
            username: 'Système',
            message: 'Bienvenue dans le mode démo ! Les messages ne sont pas sauvegardés.',
            timestamp: new Date()
          }
        ]
      };
      setCurrentUser(user);
      setCurrentRoom(room);
      return;
    }

    if (socket) {
      const user: User = {
        id: socket.id || '',
        username,
        room: ''
      };
      setCurrentUser(user);
      socket.emit('createRoom', username);
    }
  };

  const handleJoinRoom = (username: string, roomCode: string) => {
    if (demoMode) {
      setError('Le mode démo ne permet que la création de salons. Déployez le serveur pour rejoindre des salons existants.');
      return;
    }

    if (socket) {
      const user: User = {
        id: socket.id || '',
        username,
        room: roomCode
      };
      setCurrentUser(user);
      socket.emit('joinRoom', username, roomCode);
    }
  };

  const handleSendMessage = (message: string) => {
    if (demoMode && currentRoom && currentUser) {
      // Mode démo : ajouter le message localement
      const newMessage: Message = {
        id: Date.now().toString(),
        username: currentUser.username,
        message,
        timestamp: new Date()
      };
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMessage]
        };
      });
      return;
    }

    if (socket && currentUser) {
      socket.emit('sendMessage', message);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentUser(null);
    setCurrentRoom(null);
    setError(null);
    if (socket && !demoMode) {
      socket.disconnect();
      socket.connect();
    }
  };

  if (!isConnected && !demoMode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {demoMode ? 'Chargement du mode démo...' : 'Connexion au serveur...'}
          </p>
        </div>
      </div>
    );
  }

  if (currentRoom && currentUser) {
    return (
      <Room
        room={currentRoom}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        onLeaveRoom={handleLeaveRoom}
        demoMode={demoMode}
      />
    );
  }

  return (
    <Home
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      error={error}
      demoMode={demoMode}
    />
  );
};

export default App;