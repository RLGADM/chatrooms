import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ??
  (import.meta.env.PROD ? 'https://kensho-hab0.onrender.com' : 'http://localhost:3000');

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const connectTimeout = useRef<NodeJS.Timeout | null>(null);

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
      setIsConnecting(false);
      console.log('Socket connected:', newSocket.id);
      if (connectTimeout.current) clearTimeout(connectTimeout.current);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false); // on pourrait garder true si tu veux attendre la reconnexion.
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
      setIsConnecting(false);
    });

    // Timeout de sécurité : si pas connecté après X sec, on considère que ça a échoué.
    connectTimeout.current = setTimeout(() => {
      if (!newSocket.connected) {
        console.warn('Socket connection timeout');
        setIsConnecting(false);
      }
    }, 5000); // <-- tu peux ajuster ce délai

    return () => {
      newSocket.close();
      if (connectTimeout.current) clearTimeout(connectTimeout.current);
    };
  }, [socket]);

  return { socket, isConnected, isConnecting };
}
