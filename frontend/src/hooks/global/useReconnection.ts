import { useEffect, MutableRefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Room } from '@/types';
import { Socket } from 'socket.io-client';

type Params = {
  socket: any;
  isConnected: boolean;
  currentUser: User | null;
  currentRoom: Room | null;
  isPlayerInRoom: boolean;
  hasRejoinAttempted: MutableRefObject<boolean>;
  handleJoinRoom: (socket: Socket, username: string, roomCode: string) => Promise<boolean>;
  setCurrentUser: (user: User | null) => void;
  setCurrentRoom: (room: Room | null) => void;
  setInRoom: (inRoom: boolean) => void;
};

export function useReconnection({
  socket,
  isConnected,
  currentUser,
  currentRoom,
  isPlayerInRoom,
  hasRejoinAttempted,
  handleJoinRoom,
  setCurrentUser,
  setCurrentRoom,
  setInRoom,
}: Params) {
  const navigate = useNavigate();

  useEffect(() => {
    const tryReconnect = async () => {
      const storedRoom = localStorage.getItem('lastRoomCode');
      const storedUsername = localStorage.getItem('lastUsername');
      const userToken = localStorage.getItem('userToken');
      const savedSocket = socket;

      if (
        storedRoom &&
        storedUsername &&
        userToken &&
        !isPlayerInRoom &&
        socket?.connected &&
        isConnected &&
        !hasRejoinAttempted.current
      ) {
        console.log('[AUTO REJOIN] Tentative de reconnexion à', storedRoom);
        hasRejoinAttempted.current = true;

        const success = await handleJoinRoom(savedSocket, storedUsername, storedRoom);
        if (success) {
          navigate(`/room/${storedRoom}`);
        } else {
          navigate('/');
        }
      }
    };

    tryReconnect();
  }, [
    socket,
    isConnected,
    currentUser,
    currentRoom,
    isPlayerInRoom,
    hasRejoinAttempted,
    handleJoinRoom,
    navigate,
    setCurrentUser,
    setCurrentRoom,
    setInRoom,
  ]);
}
