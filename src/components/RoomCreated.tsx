import React, { useState, useRef, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Room as RoomType, User, Message, GameState } from '../types';
import PlayersManagementModal from './PlayersManagementModal';

interface RoomProps {
  room: RoomType;
  currentUser: User;
  onSendMessage: (message: string) => void;
  onLeaveRoom: () => void;
  socket: any;
}

const Room: React.FC<RoomProps> = ({ room, currentUser, onSendMessage, onLeaveRoom, socket }) => {
  const [proposal, setProposal] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [teamJoinError, setTeamJoinError] = useState<string | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  //const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);

  // Initialize game state
  const [gameState, setGameState] = useState<GameState>(() => {
    // Initialize with default game state if room.gameState exists, otherwise use default
    return room.gameState || {
      currentPhase: 0,
      phases: [
        "Attente début de la manche",
        "Phase 1 - Choix du mot", 
        "Phase 2 - Choix des mots interdits",
        "Phase 3 - Discours du Sage"
      ],
      teams: {
        red: { sage: null, disciples: [] },
        blue: { sage: null, disciples: [] }
      },
      spectators: room.users.map(user => ({ ...user, team: 'spectator', role: 'spectator' })),
      timer: null,
      timeRemaining: 0,
      totalTime: 0,
      isPlaying: false,
      score: { red: 0, blue: 0 }
    };
  });

  // Écouter les mises à jour du gameState depuis le serveur
  useEffect(() => {
    if (socket) {
      console.log('Setting up socket listeners for game state');
      
      socket.on('gameStateUpdate', (newGameState: GameState) => {
        console.log('Game state updated:', newGameState);
        setGameState(newGameState);
      });

      socket.on('teamJoinSuccess', (data: { team: string; role: string; gameState: GameState }) => {
        console.log('Team join successful:', data);
        setGameState(data.gameState);
        setIsJoiningTeam(false);
        setTeamJoinError(null);
      });

      socket.on('teamJoinError', (error: string) => {
        console.log('Team join error:', error);
        setTeamJoinError(error);
        setIsJoiningTeam(false);
        setTimeout(() => setTeamJoinError(null), 3000);
      });
      
      socket.on('gameError', (error: string) => {
        console.log('Game error:', error);
        setTeamJoinError(error);
        setTimeout(() => setTeamJoinError(null), 3000);
      });
      
      // socket.on('pong', (data) => {
      //   console.log('Pong received:', data);
      //   setDebugInfo(prev => ({ ...prev, lastPong: data }));
      // });
      
      // socket.on('debugUsersResponse', (data) => {
      //   console.log('Debug users response:', data);
      //   setDebugInfo(data);
      // });

      // socket.on('roomRoleChanged', (data: { userId: string; newRole: RoomRole }) => {
      //   console.log('Room role changed:', data);
      //   // Mettre à jour la room avec le nouveau rôle
      //   setCurrentRoom(prev => {
      //     if (!prev) return prev;
      //     return {
      //       ...prev,
      //       users: prev.users.map(user => 
      //         user.id === data.userId 
      //           ? { ...user, roomRole: data.newRole }
      //           : user
      //       )
      //     };
      //   });
      // });

      socket.on('roleChangeError', (error: string) => {
        console.log('Role change error:', error);
        setTeamJoinError(error);
        setTimeout(() => setTeamJoinError(null), 3000);
      });

      socket.on('userKicked', (data: { reason: string }) => {
        console.log('You have been kicked:', data);
        alert(`Vous avez été expulsé du salon. Raison: ${data.reason}`);
        onLeaveRoom();
      });

      socket.on('userBanned', (data: { reason: string }) => {
        console.log('You have been banned:', data);
        alert(`Vous avez été banni du salon. Raison: ${data.reason}`);
        onLeaveRoom();
      });
      return () => {
        socket.off('gameStateUpdate');
        socket.off('teamJoinSuccess');
        socket.off('teamJoinError');
        socket.off('gameError');
        socket.off('pong');
        socket.off('debugUsersResponse');
        socket.off('roomRoleChanged');
        socket.off('roleChangeError');
        socket.off('userKicked');
        socket.off('userBanned');
      };
    }
  }, [socket]);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [room.messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [room.messages]);

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposal.trim()) {
      onSendMessage(`[Proposition] ${proposal.trim()}`);
      setProposal('');
    }
  };

  const copyRoomCodeOnly = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const joinTeam = (team: 'red' | 'blue', role: 'sage' | 'disciple') => {
    if (isJoiningTeam) return; // Prevent double clicks
    
    console.log('Client: Attempting to join team:', team, role);
    setIsJoiningTeam(true);
    setTeamJoinError(null); // Clear any previous errors
    
    if (socket) {
      console.log('Client: Emitting joinTeam event');
      socket.emit('joinTeam', team, role);
      // Reset the flag after a timeout in case no response
      setTimeout(() => {
        if (isJoiningTeam) {
          console.log('Client: Timeout waiting for team join response');
          setIsJoiningTeam(false);
          setTeamJoinError('Timeout - Veuillez réessayer');
        }
      }, 5000);
    } else {
      console.log('Client: No socket connection');
      setIsJoiningTeam(false);
      setTeamJoinError('Connexion au serveur perdue');
    }
  };

  const joinSpectator = () => {
    if (isJoiningTeam) return;
    
    console.log('Client: Attempting to join spectators');
    setIsJoiningTeam(true);
    setTeamJoinError(null); // Clear any previous errors
    
    if (socket) {
      console.log('Client: Emitting joinTeam event for spectator');
      socket.emit('joinTeam', 'spectator', 'spectator');
      // Reset the flag after a timeout in case no response
      setTimeout(() => {
        if (isJoiningTeam) {
          console.log('Client: Timeout waiting for spectator join response');
          setIsJoiningTeam(false);
          setTeamJoinError('Timeout - Veuillez réessayer');
        }
      }, 5000);
    } else {
      console.log('Client: No socket connection for spectator join');
      setIsJoiningTeam(false);
      setTeamJoinError('Connexion au serveur perdue');
    }
  };

  const startGame = () => {
    if (gameState.currentPhase === 0) {
      onSendMessage('Début de la Phase 1 - Choix du mot');
      // Le serveur devrait gérer la logique du jeu
      if (socket) {
        socket.emit('startGame');
      }
    }
  };

  const pauseGame = () => {
    onSendMessage('Jeu mis en pause');
    if (socket) {
      socket.emit('pauseGame');
    }
  };

  const sendPing = () => {
    if (socket) {
      console.log('Sending ping to server...');
      socket.emit('ping');
    }
  };

  const requestDebugInfo = () => {
    if (socket) {
      console.log('Requesting debug info from server...');
      socket.emit('debugGetUsers');
    }
  };

  const handleResetGame = () => {
    // Ici vous pourrez ajouter la logique pour réinitialiser la partie
    // Par exemple: socket.emit('resetGame');
    onSendMessage('La partie a été réinitialisée par l\'Admin');
    setShowResetModal(false);
  };

  const renderUserCard = (user: User, team: string, role: string) => {
    const isCurrentUser = user.id === currentUser.id;
    const teamColor = team === 'red' ? 'red' : team === 'blue' ? 'blue' : 'gray';
    const highlight = isCurrentUser ? 'ring-2 ring-yellow-400/50' : '';
    const bgColor = team === 'red' ? 'bg-red-500/20 border-red-300/30' : 
                    team === 'blue' ? 'bg-blue-500/20 border-blue-300/30' : 
                    'bg-gray-500/20 border-gray-300/30';
    
    return (
      <div className={`${bgColor} backdrop-blur-sm rounded-xl p-4 border hover:bg-opacity-30 transition-all duration-300 ${highlight}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-${teamColor}-500 rounded-full flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{user.username}</p>
              <p className="text-white/60 text-xs">{isCurrentUser ? 'Vous' : role}</p>
            </div>
          </div>
          {role === 'sage' && <Crown className="w-4 h-4 text-yellow-400" />}
          {role === 'disciple' && <Users className="w-4 h-4 text-green-400" />}
          {role === 'spectator' && <Eye className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
    );
  };

  // Find the creator (first user)
  const creator = room.users[0];
  const isAdmin = currentUser.roomRole === 'Admin';
  const canControlGame = currentUser.roomRole === 'Admin' || currentUser.roomRole === 'Héraut';

  const handleChangeUserRole = (userId: string, newRole: any) => {
    console.log('Attempting to change user role:', userId, newRole);
    console.log('Current user is admin:', currentUser.roomRole === 'Admin');
    if (socket && currentUser.roomRole === 'Admin') {
      console.log('Emitting changeUserRoomRole event');
      socket.emit('changeUserRoomRole', userId, newRole);
    } else {
      console.log('Cannot change role - not admin or no socket');
      setTeamJoinError('Vous devez être Admin pour changer les rôles');
      setTimeout(() => setTeamJoinError(null), 3000);
    }
  };

  const handleKickUser = (userId: string, reason: string) => {
    console.log('Attempting to kick user:', userId, reason);
    if (socket && currentUser.roomRole === 'Admin') {
      socket.emit('kickUser', userId, reason);
    } else {
      setTeamJoinError('Vous devez être Admin pour expulser des utilisateurs');
      setTimeout(() => setTeamJoinError(null), 3000);
    }
  };

  const handleBanUser = (userId: string, reason: string) => {
    console.log('Attempting to ban user:', userId, reason);
    if (socket && currentUser.roomRole === 'Admin') {
      socket.emit('banUser', userId, reason);
    } else {
      setTeamJoinError('Vous devez être Admin pour bannir des utilisateurs');
      setTimeout(() => setTeamJoinError(null), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 min-h-screen transition-all duration-1000">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse opacity-5 pointer-events-none"></div>
      
      {/* Error Toast */}
      {teamJoinError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">
          {teamJoinError}
        </div>
      )}
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-3xl font-black tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>KENSHO</h1>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
              <span className="text-white text-sm font-semibold">Salon : <span className="text-yellow-300 font-bold">{room.code}</span></span>
            </div>
            <button
              onClick={copyRoomCodeOnly}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier le Code'}</span>
            </button>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-white text-sm font-semibold">Admin : <span className="text-green-300 font-bold">{room.users.find(u => u.roomRole === 'Admin')?.username || 'N/A'}</span></span>
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPlayersModal(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
            >
              <Users className="w-4 h-4" />
              <span>Joueurs</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowResetModal(true)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Relancer la partie</span>
              </button>
            )}
            <button
              onClick={() => setShowDebugModal(true)}
              className="bg-yellow-500/20 backdrop-blur-sm hover:bg-yellow-500/30 text-yellow-200 px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-yellow-300/30 flex items-center space-x-2 hover:scale-105"
            >
              <Target className="w-4 h-4" />
              <span>Debug</span>
            </button>
            <button
              onClick={onLeaveRoom}
              className="bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="relative z-10 px-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
            <div className="grid grid-cols-4 gap-4 items-center">
              
              {/* Phase de jeu */}
              <div className="col-span-1">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-3 border border-blue-300/30 text-center hover:bg-blue-500/30 transition-all duration-300">
                  <div className="flex items-center justify-center mb-2">
                    <button 
                      onClick={canControlGame ? (gameState.isPlaying ? pauseGame : startGame) : undefined}
                      disabled={!canControlGame}
                      className="text-blue-300 hover:text-white transition-colors flex items-center justify-center mr-2"
                    >
                      {gameState.isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    </button>
                    <span className="text-blue-200 text-sm font-semibold">Phase</span>
                  </div>
                  <h3 className="text-white font-bold text-sm">
                  {gameState?.phases?.[gameState.currentPhase] || "Phase inconnue"}
                </h3>
                </div>
              </div>
              
              {/* Temps restant */}
              <div className="col-span-2">
                <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-3 border border-orange-300/30 hover:bg-orange-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Timer className="w-5 h-5 text-orange-300 mr-2" />
                      <span className="text-orange-200 text-sm font-semibold">Temps</span>
                    </div>
                    <h3 className="text-white font-bold text-xl">{formatTimer(gameState.timeRemaining)}</h3>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-green-400 to-red-500" 
                        style={{ width: gameState.totalTime > 0 ? `${((gameState.totalTime - gameState.timeRemaining) / gameState.totalTime) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Score */}
              <div className="col-span-1">
                <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30 text-center hover:bg-purple-500/30 transition-all duration-300">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-5 h-5 text-purple-300 mr-2" />
                    <span className="text-purple-200 text-sm font-semibold">Score</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">
                  {gameState?.score?.red ?? 0} - {gameState?.score?.blue ?? 0}
                </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="relative z-10 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">
            
            {/* Left Column: Équipe Rouge */}
            <div className="lg:col-span-1">
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
                    <button 
                      onClick={() => joinTeam('red', 'sage')}
                      disabled={isJoiningTeam}
                      className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-yellow-300/30 hover:border-yellow-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                    </button>
                  </div>
                  <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${gameState?.teams?.red?.sage ? 'opacity-100' : 'opacity-50'}`}>
                    {gameState?.teams?.red?.sage ? (
                      renderUserCard(gameState.teams.red.sage, 'red', 'sage')
                    ) : (
                      <div className="text-center text-white/60 text-sm py-4">
                        Aucun Sage assigné
                      </div>
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
                    <button 
                      onClick={() => joinTeam('red', 'disciple')}
                      disabled={isJoiningTeam}
                      className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-blue-300/30 hover:border-blue-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(!gameState?.teams?.red?.disciples || gameState.teams.red.disciples.length === 0) ? (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                        <div className="text-center text-white/60 text-sm py-2">
                          Aucun disciple
                        </div>
                      </div>
                    ) : (
                      gameState?.teams?.red?.disciples?.map(disciple => (
                        <div key={disciple.id}>
                          {renderUserCard(disciple, 'red', 'disciple')}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Columns: Game Area */}
            <div className="lg:col-span-3">
              {/* Proposal Input */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 mb-6 hover:bg-white/15 transition-all duration-300">
                <form onSubmit={handleSubmitProposal} className="flex space-x-3">
                  <input 
                    type="text" 
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Tapez votre réponse..."
                    className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold focus:bg-white/30 transition-all duration-300"
                  />
                  <button 
                    type="submit"
                    className="bg-green-500/80 backdrop-blur-sm hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </form>
              </div>
              
              {/* Game Area Split */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* History */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 h-[600px] hover:bg-white/15 transition-all duration-300">
                  <h3 className="text-white font-bold text-xl mb-4 flex items-center">
                    <History className="w-6 h-6 mr-3 text-blue-400" />
                    Historique
                  </h3>
                  
                  <div className="space-y-3 h-[520px] overflow-y-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
                  }}>
                    {(!room?.messages || room.messages.length === 0) ? (
                      <div className="text-center text-white/60 py-12">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Aucun message pour le moment</p>
                        <p className="text-sm">L'historique apparaîtra ici</p>
                      </div>
                    ) : (
                      room.messages.map((msg) => (
                        <div key={msg.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
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

                {/* Game Interaction */}
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
                    <div className="grid grid-cols-2 gap-2 h-full content-start">
                      {/* Forbidden words will be added dynamically */}
                    </div>
                  </div>
                  
                  {/* Game Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={startGame}
                      disabled={gameState.isPlaying || !canControlGame}
                      className="bg-green-500/20 backdrop-blur-sm hover:bg-green-500/40 text-green-200 p-4 rounded-xl font-semibold transition-all duration-300 border border-green-300/30 flex items-center justify-center space-x-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5" />
                      <span>Commencer</span>
                    </button>
                    <button 
                      onClick={pauseGame}
                      disabled={!gameState.isPlaying || !canControlGame}
                      className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/40 text-red-200 p-4 rounded-xl font-semibold transition-all duration-300 border border-red-300/30 flex items-center justify-center space-x-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Pause className="w-5 h-5" />
                      <span>Pause</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Équipe Bleue + Spectateurs */}
            <div className="lg:col-span-1">
              {/* Équipe Bleue */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 mb-6">
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
                    <button 
                      onClick={() => joinTeam('blue', 'sage')}
                      disabled={isJoiningTeam}
                      className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-yellow-300/30 hover:border-yellow-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                    </button>
                  </div>
                  <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${gameState?.teams?.blue?.sage ? 'opacity-100' : 'opacity-50'}`}>
                    {gameState?.teams?.blue?.sage ? (
                      renderUserCard(gameState.teams.blue.sage, 'blue', 'sage')
                    ) : (
                      <div className="text-center text-white/60 text-sm py-4">
                        Aucun Sage assigné
                      </div>
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
                    <button 
                      onClick={() => joinTeam('blue', 'disciple')}
                      disabled={isJoiningTeam}
                      className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-blue-300/30 hover:border-blue-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {gameState?.teams?.blue?.disciples?.length === 0 ? (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                        <div className="text-center text-white/60 text-sm py-2">
                          Aucun disciple
                        </div>
                      </div>
                    ) : (
                      gameState?.teams?.blue?.disciples?.map(disciple => (
                        <div key={disciple.id}>
                          {renderUserCard(disciple, 'blue', 'disciple')}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Spectateurs */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
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
                    disabled={isJoiningTeam}
                    className="bg-gray-500/20 hover:bg-gray-500/40 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-gray-300/30 hover:border-gray-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {gameState?.spectators?.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                      <div className="text-center text-white/60 text-sm py-2">
                        Aucun spectateur
                      </div>
                    </div>
                  ) : (
                    gameState?.spectators?.map(spectator => (
                      <div key={spectator.id}>
                        {renderUserCard(spectator, 'spectator', 'spectator')}
                      </div>
                    )) 
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Players Modal */}
      <PlayersManagementModal
        isOpen={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
        users={room.users}
        currentUser={currentUser}
        onChangeUserRole={handleChangeUserRole}
        onKickUser={handleKickUser}
        onBanUser={handleBanUser}
      />

      {/* Settings Modal */}
      {showResetModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full shadow-2xl border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Relancer la partie</h2>
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Confirmation Message */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Voulez-vous réinitialiser la partie ?</h3>

              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Non, annuler
                </button>
                <button
                  onClick={handleResetGame}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Oui, réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Modal */}
      {showDebugModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Debug & Diagnostics</h2>
                <button 
                  onClick={() => setShowDebugModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Debug Actions */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={sendPing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <Timer className="w-5 h-5" />
                  <span>Ping Serveur</span>
                </button>
                <button
                  onClick={requestDebugInfo}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <Users className="w-5 h-5" />
                  <span>Info Utilisateurs</span>
                </button>
              </div>
              
              {/* Debug Info Display */}
              {debugInfo && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Informations de Debug</h3>
                  <div className="space-y-4">
                    
                    {/* Connection Info */}
                    <div className="bg-white rounded-xl p-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Connexion</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Socket ID:</span>
                          <span className="ml-2 font-mono">{debugInfo.socketId}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Utilisateur existe:</span>
                          <span className={`ml-2 font-semibold ${debugInfo.userExists ? 'text-green-600' : 'text-red-600'}`}>
                            {debugInfo.userExists ? 'Oui' : 'Non'}
                          </span>
                        </div>
                      </div>
                      {debugInfo.currentUser && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Utilisateur actuel:</span>
                          <span className="ml-2 font-mono">{JSON.stringify(debugInfo.currentUser, null, 2)}</span>
                        </div>
                      )}
                      {debugInfo.lastPong && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Dernier pong:</span>
                          <span className="ml-2 font-mono">{debugInfo.lastPong.timestamp}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Server Stats */}
                    <div className="bg-white rounded-xl p-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Statistiques Serveur</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total utilisateurs:</span>
                          <span className="ml-2 font-semibold">{debugInfo.totalUsers}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total salons:</span>
                          <span className="ml-2 font-semibold">{debugInfo.totalRooms}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* All Users */}
                    {debugInfo.allUsers && (
                      <div className="bg-white rounded-xl p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Tous les utilisateurs</h4>
                        <div className="max-h-40 overflow-y-auto">
                          <pre className="text-xs font-mono text-gray-600">
                            {JSON.stringify(debugInfo.allUsers, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {/* All Rooms */}
                    {debugInfo.allRooms && (
                      <div className="bg-white rounded-xl p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Tous les salons</h4>
                        <div className="max-h-40 overflow-y-auto">
                          <pre className="text-xs font-mono text-gray-600">
                            {JSON.stringify(debugInfo.allRooms, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {!debugInfo && (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-gray-600">Cliquez sur les boutons ci-dessus pour obtenir des informations de debug</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            © 2025 Kensho – Salon de jeu en temps réel
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Room;