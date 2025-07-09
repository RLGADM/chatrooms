import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import Home from './components/Home';
import Room from './components/Room';
import { Room as RoomType, User, Message } from './types';

// Détecte si on est en production (Netlify)
const isProduction = window.location.hostname !== 'localhost';
const SOCKET_URL = isProduction ? 'https://chatrooms-server.onrender.com' : 'http://localhost:3001';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false); // Mode démo désactivé maintenant

  const socket = useSocket(SOCKET_URL);

  useEffect(() => {
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
  }, [socket]);

  const handleCreateRoom = (username: string) => {
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
    if (socket && currentUser) {
      socket.emit('sendMessage', message);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentUser(null);
    setCurrentRoom(null);
    setError(null);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Connexion au serveur...
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
      />
    );
  }

  return (
    <Home
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      error={error}
    />
  );
};

export default App;