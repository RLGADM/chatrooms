// --------------- IMPORT
import React, { useState } from 'react';
import { useRoomTeamActions } from '../hooks/roomcreated/useRoomTeamActions';
import {
  Copy,
  Users,
  LogOut,
  Check,
  Settings,
  Play,
  Pause,
  Timer,
  Trophy,
  History,
  Gamepad2,
  Target,
  ShieldX,
  Crown,
  Eye,
  PlayCircle,
  PauseCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { useRoomCreatedMain } from '../hooks/roomcreated';
import type { User } from '@/types';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import logo from '@/assets/logo.png'; // Ajout: import du logo

// Déclaration const columns
interface LeftColumnProps {
  currentUser: User;
  isJoiningTeam: boolean;
  joinTeam: (team: 'red' | 'blue', role: 'sage' | 'disciple') => void;
  redSage?: User;
  redTeam: User[];
  renderUserCard: (user: User) => JSX.Element;
}

interface CenterColumnProps {
  proposal: string;
  setProposal: (v: string) => void;
  formatTimer: (t: number) => string;
  currentPhaseState: any;
  sendProposal: () => void;
  currentRoom: any;
  formatTime: (timestamp: Date) => string; // correction ici
  historyEndRef: React.RefObject<HTMLDivElement>;
  permissions: any;
  isGameActive: boolean;
  startGame: () => void;
  pauseGame: () => void;
}

interface RightColumnProps {
  currentUser: User;
  isJoiningTeam: boolean;
  joinTeam: (team: 'red' | 'blue', role: 'sage' | 'disciple') => void;
  blueSage?: User;
  blueTeam: User[];
  spectators: User[];
  renderUserCard: (user: User) => JSX.Element;
  joinSpectator: () => void;
}

const RightColumn: React.FC<RightColumnProps> = ({
  currentUser,
  isJoiningTeam,
  joinTeam,
  blueSage,
  blueTeam,
  spectators,
  renderUserCard,
  joinSpectator,
}) => (
  <div className="sm:col-span-1">
    {/* Équipe Bleue */}
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="text-center mb-6">
        <div className="bg-blue-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-300/30 inline-block hover:bg-blue-500/30 transition-all duration-300">
          <h3 className="text-blue-200 font-bold text-lg tracking-wide">ÉQUIPE BLEUE</h3>
        </div>
      </div>

      {/* Sage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/90 text-sm font-semibold flex items-center">
            <Crown className="w-4 h-4 mr-2 text-yellow-400" />
            Sage
          </h4>
          {(!currentUser.team || currentUser.team === 'spectator') && (
            <button
              onClick={() => joinTeam('blue', 'sage')}
              disabled={isJoiningTeam}
              className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-yellow-300/30 hover:border-yellow-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
            </button>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          {blueSage ? (
            renderUserCard(blueSage)
          ) : (
            <div className="text-center text-white/60 text-sm py-4">Aucun Sage assigné</div>
          )}
        </div>
      </div>

      {/* Disciples */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/90 text-sm font-semibold flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            Disciples
          </h4>
          {(!currentUser.team || currentUser.team === 'spectator') && (
            <button
              onClick={() => joinTeam('blue', 'disciple')}
              disabled={isJoiningTeam}
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-blue-300/30 hover:border-blue-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {blueTeam.filter((u) => u.role === 'disciple').length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
              <div className="text-center text-white/60 text-sm py-2">Aucun disciple</div>
            </div>
          ) : (
            blueTeam
              .filter((u) => u.role === 'disciple')
              .map((disciple) => (
                <div key={(disciple as any).userToken ?? (disciple as any).id}>{renderUserCard(disciple)}</div>
              ))
          )}
        </div>
      </div>
    </div>

    {/* Spectateurs */}
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 mt-6">
      <div className="text-center mb-6">
        <div className="bg-gray-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-300/30 inline-block hover:bg-gray-500/30 transition-all duration-300">
          <h3 className="text-gray-200 font-bold text-lg tracking-wide">SPECTATEURS</h3>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white/90 text-sm font-semibold flex items-center">
          <Eye className="w-4 h-4 mr-2 text-gray-400" />
          Observateurs
        </h4>
        <button
          onClick={joinSpectator}
          disabled={
            isJoiningTeam ||
            spectators.some((u: any) => (u.userToken ?? u.id) === (currentUser.userToken ?? (currentUser as any).id))
          }
          className="bg-gray-500/20 hover:bg-gray-500/40 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-gray-300/30 hover:border-gray-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
        </button>
      </div>

      <div className="space-y-3">
        {spectators.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
            <div className="text-center text-white/60 text-sm py-2">Aucun spectateur</div>
          </div>
        ) : (
          spectators.map((spectator) => (
            <div key={(spectator as any).userToken ?? (spectator as any).id}>{renderUserCard(spectator)}</div>
          ))
        )}
      </div>
    </div>
  </div>
);

const CenterColumn: React.FC<CenterColumnProps> = ({
  proposal,
  setProposal,
  formatTimer,
  currentPhaseState,
  sendProposal,
  currentRoom,
  formatTime,
  historyEndRef,
  permissions,
  isGameActive,
  startGame,
  pauseGame,
}) => (
  <div className="sm:col-span-3">
    {/* Input + Timer */}
    <div className="max-w-[520px] mx-auto mb-6">
      <div className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold transition-all duration-300 mb-4">
        <div className="flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {formatTimer(currentPhaseState?.timeRemaining ?? currentRoom?.gameState?.timeRemaining ?? 0)}
          </span>
        </div>
        <div className="relative mt-3">
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-green-400 to-red-500"
              style={{
                width: (() => {
                  const total = currentPhaseState?.timer ?? currentRoom?.gameState?.totalTime ?? 0;
                  const remaining = currentPhaseState?.timeRemaining ?? currentRoom?.gameState?.timeRemaining ?? 0;
                  if (!total) return '0%';
                  const pct = Math.max(0, Math.min(100, ((total - remaining) / (total || 1)) * 100));
                  return `${pct}%`;
                })(),
              }}
            ></div>
          </div>
        </div>
        {/* Ligne score Rouge vs Bleu */}
        <div className="mt-3">
          <div className="h-px bg-white/20 mb-3"></div>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-red-300 font-semibold">Rouge: {currentRoom?.gameState?.score?.red ?? 0}</span>
            <span className="text-white/40">|</span>
            <span className="text-blue-300 font-semibold">Bleu: {currentRoom?.gameState?.score?.blue ?? 0}</span>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendProposal();
        }}
        className="flex space-x-3"
      >
        <input
          type="text"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Tapez votre réponse..."
          className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold focus:bg-white/30 transition-all duration-300"
        />
        <button
          type="submit"
          disabled={!proposal.trim()}
          className="bg-green-500/80 backdrop-blur-sm hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          <Check className="w-5 h-5" />
        </button>
      </form>
    </div>

    {/* Historique + Zone de jeu */}
    <div className="max-w-[940px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Historique */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 h-[600px] hover:bg-white/15 transition-all duration-300">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center">
            <History className="w-6 h-6 mr-3 text-blue-400" />
            Historique
          </h3>

          <div
            className="space-y-3 h-[520px] overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)' }}
          >
            {!currentRoom?.messages || currentRoom.messages.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Aucun message pour le moment</p>
                <p className="text-sm">L'historique apparaîtra ici</p>
              </div>
            ) : (
              // Afficher le plus récent en haut
              [...currentRoom.messages]
                .slice()
                .reverse()
                .map((msg: any) => (
                  <div
                    key={msg.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{msg.message}</p>
                        <p className="text-white/60 text-xs mt-1">
                          {formatTime(msg.timestamp)} - {msg.username}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
            <div ref={historyEndRef} />
          </div>
        </div>

        {/* Zone de jeu */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 h-[600px] flex flex-col hover:bg-white/15 transition-all duration-300">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center">
            <Gamepad2 className="w-6 h-6 mr-3 text-purple-400" />
            Zone de jeu
          </h3>

          {/* Word Display */}
          <div className="mb-6">
            <div className="bg-gray-500/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-300/30 text-center hover:bg-gray-500/30 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Target className="w-8 h-8 text-gray-300 mr-3" />
                <span className="text-gray-200 text-lg font-semibold">En attente</span>
              </div>
              <h4 className="text-gray-400 font-bold text-3xl">---</h4>
            </div>
          </div>

          {/* Forbidden Words */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-6 flex-1">
            <div className="flex items-center mb-3">
              <ShieldX className="w-5 h-5 text-red-300 mr-2" />
              <span className="text-white font-semibold">Mots interdits par l'équipe</span>
            </div>
            <div className="grid grid-cols-2 gap-2 h-full content-start"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
const LeftColumn: React.FC<LeftColumnProps> = ({
  currentUser,
  isJoiningTeam,
  joinTeam,
  redSage,
  redTeam,
  renderUserCard,
}) => (
  <div className="sm:col-span-1">
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="text-center mb-6">
        <div className="bg-red-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-red-300/30 inline-block hover:bg-red-500/30 transition-all duration-300">
          <h3 className="text-red-200 font-bold text-lg tracking-wide">ÉQUIPE ROUGE</h3>
        </div>
      </div>

      {/* Sage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/90 text-sm font-semibold flex items-center">
            <Crown className="w-4 h-4 mr-2 text-yellow-400" />
            Sage
          </h4>
          {(!currentUser.team || currentUser.team === 'spectator') && (
            <button
              onClick={() => joinTeam('red', 'sage')}
              disabled={isJoiningTeam}
              className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-yellow-300/30 hover:border-yellow-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
            </button>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          {redSage ? (
            renderUserCard(redSage)
          ) : (
            <div className="text-center text-white/60 text-sm py-4">Aucun Sage assigné</div>
          )}
        </div>
      </div>

      {/* Disciples */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/90 text-sm font-semibold flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            Disciples
          </h4>
          {(!currentUser.team || currentUser.team === 'spectator') && (
            <button
              onClick={() => joinTeam('red', 'disciple')}
              disabled={isJoiningTeam}
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-blue-300/30 hover:border-blue-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {redTeam.filter((u) => u.role === 'disciple').length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
              <div className="text-center text-white/60 text-sm py-2">Aucun disciple</div>
            </div>
          ) : (
            redTeam
              .filter((u) => u.role === 'disciple')
              .map((disciple) => (
                <div key={(disciple as any).userToken ?? (disciple as any).id}>{renderUserCard(disciple)}</div>
              ))
          )}
        </div>
      </div>
    </div>
  </div>
);
function RoomCreated() {
  // intégration useParams et useState
  const { roomCode: routeRoomCode } = useParams();
  const [tempUsername, setTempUsername] = useState('');
  const navigate = useNavigate();

  // Hook principal qui gère toute la logique
  const {
    // Données
    currentUser,
    currentRoom,
    permissions,
    inRoom,
    // États UI
    proposal,
    copied,
    showPlayersModal, // ← requis
    showResetModal,
    teamJoinError,
    isJoiningTeam,
    historyEndRef,
    // initialisation des consts

    // Setters
    setProposal,
    setShowPlayersModal, // ← requis (corriger toute typo "setShowPlayersLModal")
    setShowResetModal,

    // Utilitaires
    formatTime,
    formatTimer,
    getUserCardData,

    // Actions
    copyRoomLink,
    sendProposal,
    joinTeam,
    joinSpectator,
    startGame,
    pauseGame,
    handleLeaveRoom,
    handleResetGame,
    // Nouveaux pour modal pseudo
    handleJoinRoom,
    socket,
  } = useRoomCreatedMain();

  // Protection: si pas de room ou d'utilisateur
  if (!currentRoom || !currentUser) {
    return (
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Chargement de la room...</div>
      </div>
    );
  }

  // Données dérivées pour le JSX
  const gameState = currentRoom.gameState;
  const isGameActive = Boolean(gameState?.isPlaying);
  const currentRoundState = gameState?.rounds?.[gameState.currentRound];
  const currentPhaseIndex = currentRoundState?.currentPhase ?? 0;
  const currentPhaseState = currentRoundState?.phases?.[currentPhaseIndex];

  // Fallback timer: utilise gameState.timeRemaining / totalTime si pas de données de phase locales
  const uiCurrentPhaseState = currentPhaseState ?? {
    timeRemaining: gameState?.timeRemaining ?? 0,
    timer: gameState?.totalTime ?? 0,
  };

  const redTeam = currentRoom?.users?.filter((user: User) => user.team === 'red') ?? [];
  const blueTeam = currentRoom?.users?.filter((user: User) => user.team === 'blue') ?? [];
  const spectators = currentRoom?.users?.filter((user: User) => user.team === 'spectator') ?? [];

  // Modal: calcul du modal pseudo uniquement si nécessaire
  const storedUsername =
    localStorage.getItem('username') ||
    (() => {
      try {
        const raw = localStorage.getItem('lastUsername');
        return raw ? JSON.parse(raw) : '';
      } catch {
        return '';
      }
    })();
  // vérification si modal nécessaire
  const showUsernameModal =
    !storedUsername && !inRoom && !permissions.isAdmin && Boolean(routeRoomCode ?? currentRoom?.code);

  // pré calcul
  const redSage = redTeam.find((u: User) => u.role === 'sage');
  const blueSage = blueTeam.find((u: User) => u.role === 'sage');
  // Fonction de rendu d'une carte utilisateur
  const renderUserCard = (user: User) => {
    const cardData = getUserCardData(user, currentUser.userToken);

    return (
      <div
        className={`${cardData.bgColor} backdrop-blur-sm rounded-xl p-4 border hover:bg-opacity-30 transition-all duration-300 ${cardData.highlight}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-${cardData.teamColor}-500 rounded-full flex items-center justify-center shadow-lg`}
            >
              <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{user.username}</p>
              <p className="text-white/60 text-xs">{cardData.isCurrentUser ? 'Vous' : cardData.role}</p>
            </div>
          </div>
          {cardData.role === 'sage' && <Crown className="w-4 h-4 text-yellow-400" />}
          {cardData.role === 'disciple' && <Users className="w-4 h-4 text-green-400" />}
        </div>
      </div>
    );
  };

  // Déterminer l’affichage du modal pseudo

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 min-h-screen transition-all duration-1000">
      {/* Modal pseudo (navigation privée / pas de username) */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/90 rounded-2xl p-6 w-96 shadow-2xl">
            <h2 className="text-xl font-bold mb-3 text-slate-800">Entrez votre pseudo</h2>
            <p className="text-sm text-slate-600 mb-4">Vous devez définir un pseudo pour rejoindre le salon.</p>
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Ex: KenshoPlayer"
              className="w-full border border-slate-300 rounded-xl px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!tempUsername.trim() || !socket || !(routeRoomCode ?? currentRoom?.code)}
              onClick={async () => {
                const code = routeRoomCode ?? currentRoom?.code ?? '';
                const name = tempUsername.trim();
                if (!socket || !name || !code) return;
                const success = await handleJoinRoom(socket, name, code);
                if (!success) {
                  toast.error('Salon supprimé ou introuvable');
                  localStorage.removeItem('roomCode');
                  localStorage.removeItem('lastRoomCode');
                  navigate('/');
                }
              }}
            >
              Rejoindre le salon
            </button>
          </div>
        </div>
      )}

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse opacity-5 pointer-events-none"></div>
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left Side - Game Title and Room Info */}
            <div className="flex items-center space-x-4">
              {/* Logo + Titre */}
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logo} alt="Kensho Logo" className="w-full h-full object-contain rounded-2xl" />
              </div>
              <h1
                className="text-white text-3xl font-black tracking-wider"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                KENSHO
              </h1>
              {/* Salon info */}
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <span className="text-white text-sm font-semibold">
                  Salon : <span className="text-yellow-300 font-bold">{currentRoom.code}</span>
                </span>
              </div>
              {/* Copier l'URL */}
              <button
                onClick={copyRoomLink}
                disabled={!currentRoom.code}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : "Copier l'URL"}</span>
              </button>
              {/* Compteur joueurs → cliquable pour ouvrir le modal */}
              <button
                onClick={() => setShowPlayersModal(true)}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 text-white text-sm font-semibold transition-all duration-300 hover:bg-white/30 hover:scale-105 flex items-center space-x-2"
                title="Voir la liste des joueurs connectés"
              >
                <Users className="w-4 h-4" />
                <span>{currentRoom.users.length} joueurs</span> {/* ← currentRoom utilisé ici */}
              </button>
            </div>
            {/* Right Side - Actions */}
            <div className="flex items-center space-x-4">
              {/* Supprimé: Relancer la partie */}
              {/* Supprimé: Joueurs */}

              <div className="flex items-center space-x-4">
                {/* Jouer / Pause — visible pour tous */}
                <button
                  onClick={() => {
                    console.log('[UI] Header Play/Pause clicked', { isGameActive });
                    isGameActive ? pauseGame() : startGame();
                  }}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full border border-white/30 text-sm font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105"
                  title={isGameActive ? 'Mettre en pause' : 'Démarrer la partie'}
                >
                  {isGameActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isGameActive ? 'Pause' : 'Jouer'}</span>
                </button>

                {/* Rejouer — visible pour tous (réinitialise la partie) */}
                <button
                  onClick={handleResetGame}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full border border-white/30 text-sm font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105"
                  title="Rejouer (nouvelle partie)"
                >
                  <PauseCircle className="w-4 h-4" />
                  <span>Rejouer</span>
                </button>
              </div>

              {/* Restauré: Quitter — visible pour tous */}
              <button
                onClick={handleLeaveRoom}
                className="bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105"
                title="Quitter le salon"
              >
                <LogOut className="w-4 h-4" />
                <span>Quitter</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Un SEUL conteneur grid qui englobe les 3 colonnes */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            <LeftColumn
              currentUser={currentUser}
              isJoiningTeam={isJoiningTeam}
              joinTeam={joinTeam}
              redSage={redSage}
              redTeam={redTeam}
              renderUserCard={renderUserCard}
            />
            <CenterColumn
              proposal={proposal}
              setProposal={setProposal}
              formatTimer={formatTimer}
              currentPhaseState={uiCurrentPhaseState}
              sendProposal={sendProposal}
              currentRoom={currentRoom}
              formatTime={formatTime}
              historyEndRef={historyEndRef}
              permissions={permissions}
              isGameActive={isGameActive}
              startGame={startGame}
              pauseGame={pauseGame}
            />
            <RightColumn
              currentUser={currentUser}
              isJoiningTeam={isJoiningTeam}
              joinTeam={joinTeam}
              blueSage={blueSage}
              blueTeam={blueTeam}
              spectators={spectators}
              renderUserCard={renderUserCard}
              joinSpectator={joinSpectator}
            />
          </div>
        </div>
      </main>

      {/* Modal: liste des joueurs */}
      {showPlayersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-white/20 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">Joueurs connectés</h2>
              <button
                onClick={() => setShowPlayersModal(false)}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full border border-white/30 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {currentRoom?.users?.length ? (
                currentRoom.users.map((u) => {
                  const token = (u as any).userToken ?? (u as any).id;
                  const isCreator = currentRoom?.creatorToken && token === currentRoom.creatorToken;
                  const teamLabel =
                    (u.team === 'red' && 'Équipe Rouge') || (u.team === 'blue' && 'Équipe Bleue') || 'Spectateur';
                  const roleLabel = u.role || 'spectator';

                  return (
                    <div
                      key={token}
                      className="flex items-center justify-between bg-white/10 border border-white/20 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {u.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="text-white">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{u.username || 'Utilisateur'}</span>
                            {isCreator && (
                              <span className="inline-flex items-center text-yellow-300 text-xs font-bold">
                                <Crown className="w-3 h-3 mr-1" /> Créateur
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/70">
                            {teamLabel} • {roleLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-white/70 text-sm">Aucun joueur pour le moment.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-white/20 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Réinitialiser la partie</h3>
            <p className="text-white/80 mb-6">
              Êtes-vous sûr de vouloir réinitialiser la partie ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/30 text-white py-2 rounded-lg transition-all duration-300"
              >
                Annuler
              </button>
              <button
                onClick={handleResetGame}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-white py-2 rounded-lg transition-all duration-300"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomCreated;
