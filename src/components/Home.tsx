// --------------- IMPORT

// Déclaration import framework
import React, { useEffect, useState } from 'react';
import { Users, Plus, LogIn, Sparkles, Wifi } from 'lucide-react';
// Déclaration fichiers projets
import { GameParameters } from '../types';
import GameConfigModal from './GameConfigModal';
import { getDefaultParameters } from '../utils/defaultParameters';
// Déclaration via hooks
import { useRoomEvents } from '../hooks/useRoomEvents';
import { useLocalStorageItem } from '../hooks/useLocalStorageItem';

// Déclaration const

const Home: React.FC = () => {
  //Déclaration const locales
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [parameters, setParameters] = useState<GameParameters>(getDefaultParameters());
  const [gameMode, setGameMode] = useState<'standard' | 'custom'>('standard');

  // Const via Hooks
  const [lastRoomCode] = useLocalStorageItem('lastRoomCode', '');
  const [lastUserName, setLastUserName, resetLastUserName] = useLocalStorageItem('lastUserName', '');
  // useRoomEvents
  const {
    socketIsConnected,
    currentUser,
    currentRoom,
    roomUsers,
    messages,
    error,
    inRoom,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
  } = useRoomEvents();

  // const handle
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && socketIsConnected) {
      setIsCreating(true);
      handleCreateRoom(username.trim(), gameMode, parameters);
      setTimeout(() => setIsCreating(false), 3000);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomCode.trim() && socketIsConnected) {
      setIsJoining(true);
      handleJoinRoom(username.trim(), roomCode.trim().toUpperCase());
      setTimeout(() => setIsJoining(false), 3000);
    }
  };

  const handleConfigConfirm = (selectedMode: 'standard' | 'custom', selectedParameters: GameParameters) => {
    setConfigModalOpen(false);
    setGameMode(selectedMode);
    setParameters(selectedParameters);
    if (username.trim()) {
      handleCreateRoom(username.trim(), selectedMode, selectedParameters);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom right, #00355a, #8accfd)' }}
    >
      <GameConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onConfirm={handleConfigConfirm}
      />

      <div className="absolute top-4 right-4 z-20">
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
            socketIsConnected
              ? 'bg-green-500/20 text-green-100 border border-green-400/30'
              : 'bg-red-500/20 text-red-100 border border-red-400/30'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${socketIsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
          ></div>
          <Wifi className="w-4 h-4" />
          <span>{socketIsConnected ? 'Serveur actif' : 'Serveur en veille'}</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-white/20">
          <div className="text-center mb-6">
            <div className="relative mb-4">
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="Kensho Logo"
                  className="w-full h-full object-contain rounded-2xl shadow-lg"
                />
              </div>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full p-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1
              className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              KENSHO
            </h1>
            <p className="text-gray-700 text-lg font-medium mb-4">L'art de l'esquivation !</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 text-sm font-medium mb-2">{error}</p>
            </div>
          )}

          <form className="space-y-4 mb-6">
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Votre pseudo
              </label>
              <input
                type="text"
                id="username"
                value={lastUserName}
                onChange={(e) => setLastUserName(e.target.value)}
                placeholder="Entrez votre pseudo"
                className={`w-full px-4 py-4 rounded-xl border transition-all duration-200 bg-gray-50/50 font-medium focus:outline-none focus:ring-2 ${
                  error?.toLowerCase().includes('pseudo')
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                required
                maxLength={20}
                disabled={!socketIsConnected}
              />
            </div>

            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              disabled={!lastUserName.trim() || isCreating || !socketIsConnected}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreating ? 'Création...' : 'Créer un salon'}</span>
            </button>
          </form>

          {/* {!import.meta.env.PROD && (
            <button
              onClick={onDemoMode}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span>Mode Démo</span>
            </button>
          )} */}

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Code du salon
              </label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 font-mono text-center text-lg font-bold bg-gray-50/50 tracking-wider"
                maxLength={6}
                disabled={!socketIsConnected}
              />
            </div>
            <button
              type="submit"
              disabled={!lastUserName.trim() || !roomCode.trim() || isJoining || !isConnected}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <LogIn className="w-5 h-5" />
              <span>{isJoining ? 'Connexion...' : 'Rejoindre un salon'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
