import { useEffect, useState } from 'react';
import { User, Room } from '../types';

export function useHydration(socket?: any) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedRoom = localStorage.getItem('currentRoom');

    if (storedUser && storedRoom) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedRoom = JSON.parse(storedRoom);

        setUser(parsedUser);
        setRoom(parsedRoom);
        setInRoom(true);
      } catch (error) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRoom');
        setUser(null);
        setRoom(null);
      }
    }

    setHydrated(true);
  }, [socket]);

  return { user, room, inRoom, hydrated, setUser, setRoom, setInRoom };
}
