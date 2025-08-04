import { useState, useCallback } from 'react';
import { GameParameters } from '@/types';
import { useSocketContext } from '@/components/SocketContext';
import { useRoomEvents } from '@/hooks';
import { Socket } from 'socket.io-client';

export function useHomeHandlers(initialUsername = '') {
  const { socket } = useSocketContext();
  const { handleCreateRoom, handleJoinRoom } = useRoomEvents();
  const [username, setUsername] = useState(initialUsername);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'standard' | 'custom'>('standard');
  const [parameters, setParameters] = useState<GameParameters>();
  const socketIsConnected = socket?.connected;

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (username.trim() && socketIsConnected && parameters) {
        setIsCreating(true);
        console.log('handlecreate call hdr');
        handleCreateRoom(socket, username.trim(), gameMode, parameters);
        setTimeout(() => setIsCreating(false), 3000);
      }
    },
    [username, socketIsConnected, gameMode, parameters]
  );

  const handleJoin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (username.trim() && roomCode.trim() && socketIsConnected) {
        setIsJoining(true);
        handleJoinRoom(socket, username.trim(), roomCode.trim().toUpperCase());
        localStorage.setItem('lastUsername', JSON.stringify(username));
        setTimeout(() => setIsJoining(false), 3000);
      }
    },
    [username, roomCode, socketIsConnected]
  );

  //TODO j'ai vérifié par log, chaque variable ok et on entre bien dans le if.
  const handleConfigConfirm = useCallback(
    (providedUsername: string, selectedMode: 'standard' | 'custom', selectedParameters: GameParameters) => {
      setConfigModalOpen(false);
      setGameMode(selectedMode);
      setParameters(selectedParameters);
      if (providedUsername.trim() && socket) {
        handleCreateRoom(socket, providedUsername.trim(), selectedMode, selectedParameters);
      } else {
        if (!providedUsername.trim()) {
          console.warn('Pas de username fourni dans le handleConfigConfirm');
        }
        if (!socket) {
          console.warn('Socket non initialisé dans le handleConfigConfirm');
        }
      }
    },
    [handleCreateRoom]
  );

  return {
    socketIsConnected,
    username,
    setUsername,
    roomCode,
    setRoomCode,
    isCreating,
    isJoining,
    isConfigModalOpen,
    setConfigModalOpen,
    gameMode,
    parameters,
    handleCreate,
    handleJoin,
    handleConfigConfirm,
    error,
    setError,
  };
}
