// import framework
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
// import ts et hooks
import { useSocket } from './useSocket';
import { GameParameters, Message, Room, User, emptyRoom } from '@/types';
import { useUserToken } from './useUserToken';

export function useRoomEvents() {
  const [, setLastRoomCode] = useState(() => {
    const stored = localStorage.getItem('lastRoomCode');
    try {
      return stored ? JSON.parse(stored) : '';
    } catch {
      return '';
    }
  });

  const [, setLastUsername] = useState(() => {
    const stored = localStorage.getItem('lastUsername');
    try {
      return stored ? JSON.parse(stored) : '';
    } catch {
      return '';
    }
  });

  // Déclaration ts hooks
  const userToken = useUserToken();
  const { socket, isConnected: socketIsConnected } = useSocket();
  // Déclaration local
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room>(emptyRoom);
  const [roomUsers, setRoomUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inRoom, setInRoom] = useState<boolean>(false);

  // Envoi donné inRoom et currentRoom.code à home.tsx
  useEffect(() => {
    if (!socket) return;
    socket.on('roomCreated', (room: Room) => {
      setCurrentRoom(room);
      setInRoom(true);
    });

    return () => {
      inRoom;
      currentRoom;
      socket.off('roomCreated');
    };
  }, []);

  // autre socket.on
  useEffect(() => {
    if (!socket) return;

    socket.on('roomCreated', (room: Room) => {
      setCurrentRoom(room);
    });

    socket.on('roomJoined', ({ user, room }: { user: User; room: Room }) => {
      setCurrentUser(user);
      setCurrentRoom(room);
    });

    socket.on('roomUsersUpdate', (users: User[]) => {
      setRoomUsers(users);
    });

    socket.on('receiveMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('errorMessage', (msg: string) => {
      setError(msg);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('roomUsersUpdate');
      socket.off('receiveMessage');
      socket.off('errorMessage');
    };
  }, [socket]);

  const handleJoinRoom = async (socket: Socket, username: string, roomCode: string): Promise<boolean> => {
    //console.log('entré dans handleJoinRoom');
    if (!socket?.connected) return false;
    //console.log('entré dans handlejoinroo après socket');
    // const token déclaré avant la fonction
    if (!userToken) return false;
    //console.log('vérification token');
    return new Promise((resolve) => {
      socket.emit('joinRoom', { username, roomCode, userToken }, (response: any) => {
        //console.log('dans le socket emit');
        if (response.success) {
          console.log('socket emit success');
          setLastRoomCode(roomCode);
          setLastUsername(username);
          setInRoom(true);
          //JoinTeamDefault
          socket.emit('joinTeam', {
            roomCode,
            userToken,
            team: 'spectator',
          });
          console.log('1 :', roomCode, '2 :', username, '3 : ', inRoom);

          // setCurrentUser({
          //   id: socket.id as string,
          //   username,
          //   room: roomCode,
          // });

          resolve(true);
        } else {
          setError(response.error);
          localStorage.removeItem('lastRoomCode');
          resolve(false);
        }
      });
    });
  };

  // fait avec console.log, on remplis les conditions.
  const handleCreateRoom = (
    socket: Socket,
    username: string,
    gameMode: 'standard' | 'custom',
    parameters: GameParameters
  ) => {
    console.log('entré dans handlecreateroom');

    if (!socket) return;

    socket.emit(
      'createRoom',
      { username, gameMode, parameters, userToken },
      (response: { success: boolean; roomCode?: string; error?: string }) => {
        if (response.success && response.roomCode) {
          handleJoinRoom(socket, username, response.roomCode);

          currentRoom.code = response.roomCode;
          console.log(currentRoom.code);
          console.log('getcode');

          //console.log('entré dans le success emit createRoom');
        } else {
          setError(response.error || 'Erreur lors de la création de la salle.');
        }
      }
    );
  };

  const handleLeaveRoom = () => {
    if (!socket || !currentRoom) return;

    socket.emit('leaveRoom', currentRoom.code);
    setCurrentUser(null);
    setRoomUsers([]);
    setMessages([]);
    setError(null);
  };

  return {
    socket,
    currentUser,
    currentRoom,
    roomUsers,
    messages,
    error,
    inRoom,
    socketIsConnected,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    setCurrentUser,
    setCurrentRoom,
    setInRoom,
    setRoomUsers,
    setMessages,
    setError,
  };
}
