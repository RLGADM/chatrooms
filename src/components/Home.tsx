import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Sparkles, MessageCircle, Shield, Wifi } from 'lucide-react';

//chat pour gameParams
import { GameParameters } from '../types/index';
import GameConfigModal from './GameConfigModal';
import { io, Socket } from "socket.io-client";

//chat pour cookie
// Fonction pour lire un cookie par nom
function getCookie(name: string): string | undefined {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Fonction pour écrire un cookie avec expiration en jours
function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
}

// chat pour HomeProps
interface HomeProps {
  onCreateRoom: (
    username: string,
    gameMode: 'standard' | 'custom',
    parameters: GameParameters
  ) => void;
  onJoinRoom: (username: string, roomCode: string) => void;
  onDemoMode: () => void;
  error: string | null;
  isConnected: boolean;
}


//bolt
// interface HomeProps {
//   onCreateRoom: (username: string) => void;
//   onJoinRoom: (username: string, roomCode: string) => void;
//   onDemoMode: () => void;
//   error: string | null;
//   isConnected: boolean;
// }


const Home: React.FC<HomeProps> = ({ onCreateRoom, onJoinRoom, onDemoMode, error, isConnected }) => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  //chat gpt pour cookie
  useEffect(() => {
    const savedUsername = getCookie('username');
    if (savedUsername && savedUsername !== username) {
      setUsername(savedUsername);
    }
  }, []);

  // A chaque fois que username change, enregistrer dans un cookie
  useEffect(() => {
    if (username) {
      setCookie('username', username, 30); // 30 jours d'expiration
    }
  }, [username]);

  useEffect(() => {
  if (username) {
    setCookie('username', username, 30); // Sauvegarde pour 30 jours
  }
}, [username]);

// chat pour gameParams
const [gameConfig, setGameConfig] = useState<{
  mode: 'standard' | 'custom';
  parameters: GameParameters;
} | null>(null);
// chat pour import gameParams
const [gameMode, setGameMode] = useState<'standard' | 'custom'>('standard');

const [parameters, setParameters] = useState<GameParameters>({
  ParametersTimeFirst: 20,
  ParametersTimeSecond: 90,
  ParametersTimeThird: 120,
  ParametersTeamReroll: 2,
  ParametersTeamMaxForbiddenWords: 6,
  ParametersTeamMaxPropositions: 5,
  ParametersPointsMaxScore: 3,
  ParametersPointsRules: 'no-tie',
  ParametersWordsListSelection: {
    veryCommon: true,
    lessCommon: true,
    rarelyCommon: false
  }
});
//chat pour verifier si gameConfig est défini
const [isConfigModalOpen, setConfigModalOpen] = useState(false);


// bolt

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && isConnected) {
      setIsCreating(true);
      onCreateRoom(username.trim());
      setTimeout(() => setIsCreating(false), 3000);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomCode.trim() && isConnected) {
      setIsJoining(true);
      onJoinRoom(username.trim(), roomCode.trim().toUpperCase());
      setTimeout(() => setIsJoining(false), 3000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #00355a, #8accfd)' }}>
      {/* Server Status Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
          isConnected 
            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
            : 'bg-red-500/20 text-red-100 border border-red-400/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          <Wifi className="w-4 h-4" />
          <span>{isConnected ? 'Serveur actif' : 'Serveur en veille'}</span>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Dynamic animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        {[...Array(12)].map((_, i) => {
          const shapes = ['circle', 'square', 'triangle', 'diamond'];
          const shape = shapes[i % shapes.length];
          const size = 8 + (i % 3) * 4; // Tailles variées: 8px, 12px, 16px
          const animationDuration = 15 + (i % 5) * 5; // 15s à 35s
          const delay = i * 2; // Décalage pour chaque élément
          
          return (
            <div
              key={`shape-${i}`}
              className={`absolute bg-white/20 ${
                shape === 'circle' ? 'rounded-full' :
                shape === 'square' ? 'rounded-sm' :
                shape === 'triangle' ? 'rounded-sm transform rotate-45' :
                'rounded-sm transform rotate-45'
              }`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatAcross ${animationDuration}s linear infinite`,
                animationDelay: `${delay}s`
              }}
            />
          );
        })}
        
        {/* Diagonal lines moving */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute bg-white/10"
            style={{
              width: '2px',
              height: '100px',
              left: `${i * 20}%`,
              top: '-100px',
              transform: 'rotate(45deg)',
              animation: `slideDown ${20 + i * 3}s linear infinite`,
              animationDelay: `${i * 3}s`
            }}
          />
        ))}
        
        {/* Pulsing dots */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-3 h-3 bg-white/15 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
              animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
        
        {/* Orbiting elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32">
          <div 
            className="absolute w-4 h-4 bg-white/20 rounded-full"
            style={{
              animation: 'orbit 25s linear infinite'
            }}
          />
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40">
          <div 
            className="absolute w-3 h-3 bg-white/15 rounded-full"
            style={{
              animation: 'orbit 30s linear infinite reverse'
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes floatAcross {
          0% {
            transform: translateX(-20px) translateY(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 20px)) translateY(-50px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes slideDown {
          0% {
            transform: translateY(-100px) rotate(45deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(45deg);
            opacity: 0;
          }
        }
        
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(60px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(60px) rotate(-360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
        }
      `}</style>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-white/20">
          {/* Header */}
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
            <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              KENSHO
            </h1>
            <p className="text-gray-700 text-lg font-medium mb-4">
              L'art de l'esquivation !
            </p>
            <div className={`mt-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <Wifi className="w-4 h-4" />
              <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                    <p>• Vous pouvez aussi rafraîchir la page si nécessaire</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium mb-2">{error}</p>
                  {error.includes('veille') && (
                    <div className="text-red-700 text-xs space-y-1">
                      <p>• Le serveur gratuit se met en veille après 15 min d'inactivité</p>
                      <p>• Premier réveil : 30-60 secondes</p>
                      <p>• Patientez, la connexion va se rétablir automatiquement</p>
                    </div>
                  )}
                </div>
                {error.includes('Réveil') && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-600"></div>
                      <span className="text-red-700 text-xs">Réveil du serveur en cours...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateRoom} className="space-y-4 mb-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Votre pseudo
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre pseudo"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 font-medium"
                required
                maxLength={20}
                disabled={!isConnected}
              />
            </div>
            {/* chat way */}
            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              disabled={!username.trim() || isCreating || !isConnected}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreating ? 'Création...' : 'Créer un salon'}</span>
            </button>

            <GameConfigModal
              isOpen={isConfigModalOpen}
              onClose={() => setConfigModalOpen(false)}
              onConfirm={(selectedMode, selectedParameters) => {
                setConfigModalOpen(false);
                socket.emit('createRoom', {
                  username,
                  gameMode: selectedMode,
                  parameters: selectedParameters
                });
              }}
            />
            {/* bolt way */}

            {/* <button
              type="submit"
              disabled={!username.trim() || isCreating || !isConnected}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreating ? 'Création...' : 'Créer un salon'}</span>
            </button> */}
          </form>

          {!import.meta.env.PROD && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">ou</span>
              </div>
            </div>
            
            <button
              onClick={onDemoMode}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span>Mode Démo</span>
            </button>
          </>
        )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">ou</span>
            </div>
          </div>

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
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 font-mono text-center text-lg font-bold bg-gray-50/50 tracking-wider"
                maxLength={6}
                disabled={!isConnected}
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim() || !roomCode.trim() || isJoining || !isConnected}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <LogIn className="w-5 h-5" />
              <span>{isJoining ? 'Connexion...' : 'Rejoindre le salon'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Application de chat temps réel sécurisée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;