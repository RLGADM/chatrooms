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
    const lastUsernameRaw = localStorage.getItem('lastUsername');
    const lastUsername = lastUsernameRaw ? JSON.parse(lastUsernameRaw) : '';

    if (!userToken || !lastRoomCode) return;
    if (hasLeftRoom === 'true' || hasLeftRoom === 'yes') {
      setInRoom(false);
      return;
    }

    // Utiliser le username, pas le token
    handleJoinRoom(socket, lastUsername, lastRoomCode).then((success) => {
      if (success) {
        setInRoom(true);
        navigate(`/room/${lastRoomCode}`);
      } else {
        setInRoom(false);
      }
    });
  }, [isConnected]);
}
