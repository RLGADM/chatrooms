import React, { useState } from 'react';
import { Users, Plus, LogIn } from 'lucide-react';

interface HomeProps {
  onCreateRoom: (username: string) => void;
  onJoinRoom: (username: string, roomCode: string) => void;
  error: string | null;
  demoMode?: boolean;
}

const Home: React.FC<HomeProps> = ({ onCreateRoom, onJoinRoom, error, demoMode = false }) => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsCreating(true);
      onCreateRoom(username.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomCode.trim()) {
      onJoinRoom(username.trim(), roomCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ChatRooms</h1>
          <p className="text-gray-600">
            {demoMode ? 'Mode démo - Créez un salon de discussion' : 'Créez ou rejoignez un salon de discussion'}
          </p>
          {demoMode && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-2">
              Mode démo actif - Les données ne sont pas persistantes
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleCreateRoom} className="space-y-4 mb-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Votre pseudo
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre pseudo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              required
              maxLength={20}
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim() || isCreating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>{isCreating ? 'Création...' : 'Créer un salon'}</span>
          </button>
        </form>

        {!demoMode && (
          <>
            <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Code du salon
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ex: A7K3Z2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-mono text-center"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim() || !roomCode.trim()}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <LogIn className="w-5 h-5" />
            <span>Rejoindre le salon</span>
          </button>
        </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;