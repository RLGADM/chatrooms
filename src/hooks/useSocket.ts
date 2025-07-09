import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export const useSocket = (serverUrl: string | null) => {
  const socketRef = useRef<SocketType | null>(null);

  useEffect(() => {
    if (!serverUrl) {
      return;
    }

    socketRef.current = io(serverUrl);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  return socketRef.current;
};