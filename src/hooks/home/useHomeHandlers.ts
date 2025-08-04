import { useState, useCallback } from 'react';
import { GameParameters } from '@/types';
import { useSocketContext } from '@/components/SocketContext';
import { useRoomEvents } from '@/hooks';

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
        handleCreateRoom(username.trim(), gameMode, parameters);
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
        handleJoinRoom(username.trim(), roomCode.trim().toUpperCase());
        localStorage.setItem('lastUsername', JSON.stringify(username));
        setTimeout(() => setIsJoining(false), 3000);
      }
    },
    [username, roomCode, socketIsConnected]
  );

  const handleConfigConfirm = useCallback(
    (providedUsername: string, selectedMode: 'standard' | 'custom', selectedParameters: GameParameters) => {
      console.log('providedUsername : ', providedUsername);
      setConfigModalOpen(false);
      setGameMode(selectedMode);
      setParameters(selectedParameters);
      if (providedUsername.trim()) {
        handleCreateRoom(providedUsername.trim(), selectedMode, selectedParameters);
      } else {
        console.warn('Pas de username fourni dans le handleConfigConfirm');
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
