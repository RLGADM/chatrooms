import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.PROD
  ? 'https://kensho-hab0.onrender.com'
  : 'http://localhost:3000';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  


  useEffect(() => {
    if (socket) return;
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    setSocket(newSocket);


    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', newSocket.id);
    });
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('connect_error', () => setIsConnected(false));

    return () => {
      newSocket.close();
    };
  }, [socket]);

  return { socket, isConnected,  };
}