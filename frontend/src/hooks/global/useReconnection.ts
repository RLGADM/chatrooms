import { useEffect, MutableRefObject } from 'react';
import { useNavigate } from 'react-router-dom';

type Params = {
  socket: any;
  isConnected: boolean;
  hasRejoinAttempted: MutableRefObject<boolean>;
  handleJoinRoom: (socket: any, username: string, roomCode: string) => Promise<boolean>;
  setInRoom: (inRoom: boolean) => void;
};

export function useReconnection({ socket, isConnected, hasRejoinAttempted, handleJoinRoom, setInRoom }: Params) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected || hasRejoinAttempted.current) return;

    hasRejoinAttempted.current = true;

    const userToken = localStorage.getItem('userToken');
    const lastRoomCode = localStorage.getItem('lastRoomCode');
    const hasLeftRoom = localStorage.getItem('hasLeftRoom');

    if (!userToken || !lastRoomCode) return;

    // Si l'utilisateur a quitté volontairement, ne pas tenter de rejoindre
    if (hasLeftRoom === 'true') {
      setInRoom(false);
      return;
    }

    // Tenter de rejoindre la room avec un rôle spectateur
    handleJoinRoom(socket, userToken, lastRoomCode).then((success) => {
      if (success) {
        setInRoom(true);
        navigate(`/room/${lastRoomCode}`);
      } else {
        setInRoom(false);
      }
    });
  }, [isConnected]);
}
