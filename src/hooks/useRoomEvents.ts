import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { GameParameters, Message, Room, User } from '../types';

export function useRoomEvents() {
  const { socket, isConnected } = useSocket();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomUsers, setRoomUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const inRoom = !!currentRoom;

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

  const handleJoinRoom = (username: string, roomCode: string) => {
    if (!socket || !isConnected) return;

    const userToken = localStorage.getItem('userToken');

    socket.emit('joinRoom', { username, roomCode, userToken }, (response: any) => {
      if (response.success) {
        localStorage.setItem('lastRoomCode', roomCode);
        localStorage.setItem('lastUsername', username);
      } else {
        setError(response.error);
      }
    });
  };

  const handleCreateRoom = (username: string, gameMode: 'standard' | 'custom', parameters: GameParameters) => {
    if (!socket || !isConnected) return;

    const userToken = localStorage.getItem('userToken');

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
    localStorage.removeItem('lastRoomCode');
  };

  return {
    currentUser,
    currentRoom,
    roomUsers,
    messages,
    error,
    inRoom,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    setCurrentUser,
    setCurrentRoom,
    setRoomUsers,
    setMessages,
    setError,
  };
}
