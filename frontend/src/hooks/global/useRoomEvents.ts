// import framework
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
// import ts et hooks
import { useSocket } from './useSocket';
import { GameParameters, Message, Room, User, emptyRoom, emptyUser } from '@/types';
import { useUserToken } from './useUserToken';

export function useRoomEvents() {
  // Déclaration ts hooks
  const userToken = useUserToken();
  const { socket, isConnected: socketIsConnected } = useSocket();
  // Déclaration local
  const [currentUser, setCurrentUser] = useState<User>(emptyUser);
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

    // Événements alignés avec le backend
    socket.on('usersUpdate', (users: User[]) => {
      setRoomUsers(users);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('usersUpdate');
      socket.off('newMessage');
    };
  }, [socket]);

  const handleJoinRoom = async (socket: Socket, username: string, roomCode: string): Promise<boolean> => {
    if (!socket?.connected) return false;
    if (!userToken) return false;

    return new Promise((resolve) => {
      socket.emit('joinRoom', { username, roomCode, userToken }, (response: any) => {
        if (response.success) {
          console.log('socket emit success');

          // Persistance
          localStorage.setItem('lastRoomCode', roomCode);
          localStorage.setItem('roomCode', roomCode); // pour hydratation future
          localStorage.setItem('lastUsername', JSON.stringify(username));

          setInRoom(true);
          setCurrentRoom((prev) => ({ ...prev, code: roomCode }));

          // Spectateur par défaut
          socket.emit('joinTeam', { roomCode, userToken, team: 'spectator' });

          console.log('1 :', roomCode, '2 :', username, '3 : ', inRoom);
          resolve(true);
        } else {
          setError(response.error);
          localStorage.removeItem('lastRoomCode');
          resolve(false);
        }
      });
    });
  };

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
          // Join immédiat
          handleJoinRoom(socket, username, response.roomCode);
          // Préparer l’état pour la navigation
          setCurrentRoom((prev) => ({ ...prev, code: response.roomCode }));
        } else {
          setError(response.error || 'Erreur lors de la création de la salle.');
        }
      }
    );
  };

  //TODO le déplacer dans le hook du game
  // const handleLeaveRoom = () => {
  //   if (!socket || !currentRoom) return;

  //   socket.emit('leaveRoom', currentRoom.code);
  //   setRoomUsers([]);
  //   setMessages([]);
  //   setError(null);
  // };

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
    //handleLeaveRoom,
    setCurrentUser,
    setCurrentRoom,
    setInRoom,
    setRoomUsers,
    setMessages,
    setError,
  };
}
