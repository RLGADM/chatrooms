// REFACTO COMPLET
// Déclaration import
import React, { useEffect, useRef, useState, useTransition } from 'react';
import Home from './components/Home';
import RoomCreated from './components/RoomCreated';
import DemoMode from './components/DemoMode';
import SocketDebugger from './components/SocketDebugger';
import KeepAlive from './components/KeepAlive';
import { useSocket } from './hooks/useSocket';
import { useHydration } from './hooks/useHydration';
import { useRoomEvents } from './hooks/useRoomEvents';
import { User, Room as RoomType, Message, GameParameters, ServerResetPayload, emptyUser } from './types';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
//const globale
const SERVER_URL = import.meta.env.PROD ? 'https://kensho-hab0.onrender.com' : 'http://localhost:3000';

//const main React
const App: React.FC = () => {
  // const locales
  const { socket } = useSocket();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const hasJoinedRoomRef = useRef(false);
  const navigate = useNavigate();
  const serverHasResetRef = useRef(false);
  const hasRejoinAttempted = useRef(false);

  //Nouveau const via hooks :
  const { user, hydrated } = useHydration();
  const {
    inRoom,
    setInRoom,
    currentRoom,
    setCurrentRoom,
    currentUser,
    setCurrentUser,
    roomUsers,
    isConnected,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    messages,
    setMessages,
    sendMessage,
    error,
    setError,
  } = useRoomEvents();

  //hydrated des données
  useEffect(() => {
    if (hydrated && user) {
      setCurrentUser(user);

      // on ne restaure pas automatiquement la room !
      setCurrentRoom(null);
      setInRoom(false);
    }
  }, [hydrated, user]);

  //log sur socket
  useEffect(() => {
    if (!socket) {
      console.log('Socket not initialized yet');
      return;
    }

    if (!socket.connected) {
      console.log('Socket initialized but not connected yet, attempting to connect...');
      socket.connect();
    } else {
      console.log('Socket is already connected with id:', socket.id);
    }
  }, [socket, navigate]);

  // création token pour reconnect F5
  useEffect(() => {
    if (!localStorage.getItem('userToken')) {
      const token = crypto.randomUUID(); // Génère un token unique (ex: 'f1d1bca8-...')
      localStorage.setItem('userToken', token);
    }
  }, []);
  //reconnect si F5

  useEffect(() => {
    const storedRoom = localStorage.getItem('lastRoomCode');
    const storedUsername = localStorage.getItem('lastUsername');
    const userToken = localStorage.getItem('userToken');
    if (
      storedRoom &&
      storedUsername &&
      userToken &&
      !inRoom &&
      socket?.connected &&
      isConnected &&
      !hasRejoinAttempted.current
    ) {
      console.log('[AUTO REJOIN] Tentative de reconnexion à', storedRoom);
      socket.emit(
        'joinRoom',
        {
          username: storedUsername,
          roomCode: storedRoom,
          userToken, // 👉 on le passe au serveur
        },
        (response: { success: boolean; error?: string }) => {
          console.log('[CLIENT] joinRoom response:', response);
          if (response.success) {
            setInRoom(true);
            setCurrentUser({
              id: socket.id as string,
              username: storedUsername,
              room: storedRoom,
            });
          } else {
            toast.error(response.error || 'Erreur de reconnexion à la room');
            localStorage.removeItem('lastRoomCode');
            localStorage.removeItem('lastUsername');
            navigate('/'); // Redirection vers l’accueil
          }
        }
      );
    }
  }, [socket, isConnected, inRoom, navigate]);

  useEffect(() => {
    if (socket?.connected && currentUser && currentRoom && isConnected && hydrated && !hasJoinedRoomRef.current) {
      hasJoinedRoomRef.current = true;
      socket.emit('joinTeam', 'spectator', 'spectator');
    }
  }, [socket, currentUser, currentRoom, isConnected, hydrated]);

  useEffect(() => {
    hasJoinedRoomRef.current = false;
  }, [socket]);

  setError(null);

  // Génération token si absent
  let userToken = localStorage.getItem('userToken');
  if (!userToken) {
    userToken = crypto.randomUUID();
    localStorage.setItem('userToken', userToken);
  }

  if (!socket?.id) {
    console.error('Socket not connected or ID missing.');
    return;
  }

  if (!socket.connected) {
    console.error('Socket non connecté');
    return;
  }

  if (isDemoMode) return <DemoMode />;
  if (!isConnected) return <div>Connexion échouée.</div>;

  return (
    <>
      <Toaster position="top-center" />
      <KeepAlive serverUrl={SERVER_URL} />
      <SocketDebugger socket={socket} isConnected={isConnected} />
      <Routes>
        <Route
          path="/"
          element={<Home onDemoMode={() => setIsDemoMode(true)} error={error} isConnected={isConnected} />}
        />

        <Route
          path="/room/:roomCode"
          element={
            inRoom && currentRoom && currentUser ? (
              <RoomCreated
                room={currentRoom}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                setCurrentUser={setCurrentUser}
                setCurrentRoom={setCurrentRoom}
                setError={setError}
                hasJoinedRoomRef={hasJoinedRoomRef}
                hasRejoinAttempted={hasRejoinAttempted}
                socket={socket}
              />
            ) : (
              <p className="text-center mt-10 text-red-600">
                Vous n’êtes pas dans une salle . Veuillez retourner à l ’accueil.
              </p>
            )
          }
        />
        <Route path="/demo" element={<DemoMode />} />
      </Routes>
    </>
  );
};

export default App;
