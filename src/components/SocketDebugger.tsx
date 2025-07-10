import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Activity, Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SocketDebuggerProps {
  socket: Socket | null;
  isConnected: boolean;
}

interface DebugEvent {
  id: string;
  timestamp: Date;
  type: 'in' | 'out' | 'error' | 'connection';
  event: string;
  data?: any;
}

const SocketDebugger: React.FC<SocketDebuggerProps> = ({ socket, isConnected }) => {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [lastPing, setLastPing] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Écouter tous les événements entrants
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      const debugEvent: DebugEvent = {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date(),
        type: 'in',
        event: eventName,
        data: args.length === 1 ? args[0] : args
      };
      
      setEvents(prev => [debugEvent, ...prev.slice(0, 49)]); // Garder seulement 50 événements
    };

    // Écouter les événements de connexion
    const handleConnect = () => {
      const debugEvent: DebugEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'connection',
        event: 'connect'
      };
      setEvents(prev => [debugEvent, ...prev.slice(0, 49)]);
      
      // Obtenir les infos de connexion
      setConnectionInfo({
        id: socket.id,
        transport: socket.io.engine.transport.name,
        upgraded: socket.io.engine.upgraded
      });
    };

    const handleDisconnect = (reason: string) => {
      const debugEvent: DebugEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'connection',
        event: 'disconnect',
        data: reason
      };
      setEvents(prev => [debugEvent, ...prev.slice(0, 49)]);
      setConnectionInfo(null);
    };

    const handleConnectError = (error: any) => {
      const debugEvent: DebugEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'error',
        event: 'connect_error',
        data: error.message || error
      };
      setEvents(prev => [debugEvent, ...prev.slice(0, 49)]);
    };

    // Intercepter les émissions (événements sortants)
    const originalEmit = socket.emit.bind(socket);
    socket.emit = function(eventName: string, ...args: any[]) {
      const debugEvent: DebugEvent = {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date(),
        type: 'out',
        event: eventName,
        data: args.length === 1 ? args[0] : args
      };
      setEvents(prev => [debugEvent, ...prev.slice(0, 49)]);
      
      return originalEmit(eventName, ...args);
    };

    // Enregistrer les listeners
    socket.onAny(handleAnyEvent);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Ping périodique pour tester la latence
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const startTime = Date.now();
        socket.emit('ping');
        
        const handlePong = () => {
          const latency = Date.now() - startTime;
          setLastPing(latency);
          socket.off('pong', handlePong);
        };
        
        socket.on('pong', handlePong);
      }
    }, 10000); // Ping toutes les 10 secondes

    return () => {
      socket.offAny(handleAnyEvent);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      clearInterval(pingInterval);
      
      // Restaurer la méthode emit originale
      socket.emit = originalEmit;
    };
  }, [socket]);

  const getEventColor = (event: DebugEvent) => {
    switch (event.type) {
      case 'in':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'out':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'connection':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEventIcon = (event: DebugEvent) => {
    switch (event.type) {
      case 'in':
        return '↓';
      case 'out':
        return '↑';
      case 'error':
        return '⚠';
      case 'connection':
        return event.event === 'connect' ? '🔗' : '🔌';
      default:
        return '•';
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const testConnection = () => {
    if (socket) {
      socket.emit('ping');
      socket.emit('debugGetUsers');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200 z-50"
        title="Ouvrir le debugger Socket.IO"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-800">Socket.IO Debug</span>
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Connection Info */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">ID:</span>
            <span className="ml-1 font-mono">{connectionInfo?.id || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Transport:</span>
            <span className="ml-1 font-mono">{connectionInfo?.transport || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Ping:</span>
            <span className="ml-1 font-mono">{lastPing ? `${lastPing}ms` : 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Événements:</span>
            <span className="ml-1 font-mono">{events.length}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-2 border-b border-gray-200 flex space-x-2">
        <button
          onClick={testConnection}
          className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
        >
          Test Connexion
        </button>
        <button
          onClick={clearEvents}
          className="flex-1 bg-gray-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-600 transition-colors"
        >
          Effacer
        </button>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Aucun événement enregistré
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-2 rounded border text-xs ${getEventColor(event)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg leading-none">
                    {getEventIcon(event)}
                  </span>
                  <span className="font-semibold">{event.event}</span>
                </div>
                <span className="text-xs opacity-75">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {event.data && (
                <div className="font-mono text-xs opacity-75 truncate">
                  {typeof event.data === 'string' 
                    ? event.data 
                    : JSON.stringify(event.data).substring(0, 100)
                  }
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocketDebugger;