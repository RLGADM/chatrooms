import { useState, useCallback } from 'react';
import { useSocket } from '@/hooks/global/useSocket';
import { GameState, User } from '@/types/index';
//import { getLocalStorage } from '@/utils/storage'; // utilitaire à créer si non existant

interface UseRoomActionsProps {
  gameState: GameState;
  currentUser: User | undefined;
  setCurrentUser: (user: User) => void;
}

export function useRoomActions({ gameState, currentUser, setCurrentUser }: UseRoomActionsProps) {
  const { socket, isConnected } = useSocket();
  const [actionLock, setActionLock] = useState(false);

  const lockAction = useCallback(() => {
    setActionLock(true);
    setTimeout(() => setActionLock(false), 500); // évite le spam
  }, []);

  const emitAction = useCallback(
    (event: string, payload: any) => {
      if (!socket || !isConnected || actionLock) return;
      socket.emit(event, payload);
      lockAction();
    },
    [socket, isConnected, actionLock, lockAction]
  );

  const userToken = currentUser?.userToken || localStorage.getItem('userToken');
  const roomCode = currentUser?.room || localStorage.getItem('lastRoomCode');

  // ✅ Rejoindre une équipe
  const joinTeam = (team: 'red' | 'blue') => {
    if (!userToken || !roomCode) return;

    emitAction('joinTeam', { team, userToken, roomCode });
    setCurrentUser({ ...currentUser!, team });
  };

  // ✅ Prendre un rôle (sage ou disciple)
  const takeRole = (role: 'sage' | 'disciple') => {
    if (!userToken || !roomCode || !currentUser?.team) return;

    // Si sage déjà existant dans cette équipe, il redeviendra disciple
    emitAction('changeRole', {
      team: currentUser.team,
      role,
      userToken,
      roomCode,
    });

    setCurrentUser({ ...currentUser!, role });
  };

  // ✅ Passer spectateur
  const becomeSpectator = () => {
    if (!userToken || !roomCode) return;

    emitAction('becomeSpectator', { userToken, roomCode });
    setCurrentUser({ ...currentUser!, team: 'spectator', role: 'spectator' });
  };

  // ✅ Quitter la salle
  const leaveRoom = () => {
    if (!userToken || !roomCode) return;

    emitAction('leaveRoom', { userToken, roomCode });
    localStorage.setItem('hasLeftRoom', 'true');
  };

  return {
    joinTeam,
    takeRole,
    becomeSpectator,
    leaveRoom,
    actionLock,
  };
}
