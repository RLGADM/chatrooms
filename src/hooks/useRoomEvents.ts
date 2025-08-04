import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { GameParameters, Message, Room, User } from '../types';
import { useLocalStorageItem } from './useLocalStorageItem';
import { useUserToken } from './useUserToken';

export function useRoomEvents() {
  //const via hooks
  const [lastRoomCode, setLastRoomCode, resetLastRoomCode] = useLocalStorageItem('lastRoomCode', '');
  const [lastUsername, setLastUsername, resetLastUsername] = useLocalStorageItem('lastUsername', '');

  const userToken = useUserToken();

  const { socket, isConnected: socketIsConnected } = useSocket();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomUsers, setRoomUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inRoom, setInRoom] = useState<boolean>(false);

  // const inRoom = !!currentRoom; La merde créé par CHATGPT

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

  const handleJoinRoom = async (username: string, roomCode: string): Promise<boolean> => {
    if (!socket || !socketIsConnected) return false;

    // const token déclaré avant la fonction
    if (!userToken) return false;

    return new Promise((resolve) => {
      socket.emit('joinRoom', { username, roomCode, userToken }, (response: any) => {
        if (response.success) {
          setLastRoomCode(roomCode);
          setLastUsername(username);

          setInRoom(true);

          setCurrentUser({
            id: socket.id as string,
            username,
            room: roomCode,
          });

          resolve(true);
        } else {
          setError(response.error);
          resetLastRoomCode();
          resetLastUsername();
          resolve(false);
        }
      });
    });
  };

  const handleCreateRoom = (username: string, gameMode: 'standard' | 'custom', parameters: GameParameters) => {
    if (!socket || !socketIsConnected) return;

    //const token déclaré avant function

    socket.emit(
      'createRoom',
      { username, gameMode, parameters, userToken },
      (response: { success: boolean; roomCode?: string; error?: string }) => {
        if (response.success && response.roomCode) {
          handleJoinRoom(username, response.roomCode);
        } else {
          setError(response.error || 'Erreur lors de la création de la salle.');
        }
      }
    );
  };

  const handleLeaveRoom = () => {
    if (!socket || !currentRoom) return;

    socket.emit('leaveRoom', currentRoom.code);
    setCurrentRoom(null);
    setCurrentUser(null);
    setRoomUsers([]);
    setMessages([]);
    setError(null);
    resetLastRoomCode();
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
