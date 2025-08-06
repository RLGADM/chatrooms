import React, { useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';

interface DemoUser {
  id: string;
  username: string;
  team: 'red' | 'blue' | 'spectator';
  role: 'sage' | 'disciple' | 'spectator';
}

interface DemoMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface DemoGameState {
  currentPhase: number;
  phases: string[];
  teams: {
    red: { sage: DemoUser | null; disciples: DemoUser[] };
    blue: { sage: DemoUser | null; disciples: DemoUser[] };
  };
  spectators: DemoUser[];
  timeRemaining: number;
  totalTime: number;
  isPlaying: boolean;
  score: { red: number; blue: number };
  currentWord: string;
  forbiddenWords: string[];
}

const DemoMode: React.FC = () => {
  const [currentUser] = useState<DemoUser>({
    id: 'demo-user-1',
    username: 'Vous',
    team: 'spectator',
    role: 'spectator',
  });

  const [gameState, setGameState] = useState<DemoGameState>({
    currentPhase: 0,
    phases: [
      'Attente début de la manche',
      'Phase 1 - Choix du mot',
      'Phase 2 - Choix des mots interdits',
      'Phase 3 - Discours du Sage',
    ],
    teams: {
      red: {
        sage: { id: 'demo-sage-red', username: 'Alice', team: 'red', role: 'sage' },
        disciples: [
          { id: 'demo-disciple-red-1', username: 'Bob', team: 'red', role: 'disciple' },
          { id: 'demo-disciple-red-2', username: 'Charlie', team: 'red', role: 'disciple' },
        ],
      },
      blue: {
        sage: { id: 'demo-sage-blue', username: 'Diana', team: 'blue', role: 'sage' },
        disciples: [{ id: 'demo-disciple-blue-1', username: 'Eve', team: 'blue', role: 'disciple' }],
      },
    },
    spectators: [currentUser],
    timeRemaining: 0,
    totalTime: 0,
    isPlaying: false,
    score: { red: 2, blue: 1 },
    currentWord: 'LIBERTÉ',
    forbiddenWords: ['PRISON', 'CAGE', 'CHAÎNE', 'ESCLAVE'],
  });

  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      id: '1',
      username: 'Système',
      message: 'Salon créé par Alice',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      username: 'Système',
      message: 'Diana a rejoint le salon',
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: '3',
      username: 'Alice',
      message: 'Salut tout le monde ! Prêts pour une partie ?',
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: '4',
      username: 'Diana',
      message: 'Oui, allons-y !',
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: '5',
      username: 'Système',
      message: "Bob est devenu Disciple de l'équipe Rouge",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const [proposal, setProposal] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);

  // Timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState.isPlaying && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isPlaying, gameState.timeRemaining]);

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposal.trim()) {
      const newMessage: DemoMessage = {
        id: Date.now().toString(),
        username: currentUser.username,
        message: `[Proposition] ${proposal.trim()}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setProposal('');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}?code=DEMO01`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinTeam = (team: 'red' | 'blue', role: 'sage' | 'disciple') => {
    setIsJoiningTeam(true);

    setTimeout(() => {
      // Simuler le changement d'équipe
      setGameState((prev) => {
        const newState = { ...prev };

        // Retirer l'utilisateur de sa position actuelle
        newState.spectators = newState.spectators.filter((u) => u.id !== currentUser.id);
        newState.teams.red.disciples = newState.teams.red.disciples.filter((u) => u.id !== currentUser.id);
        newState.teams.blue.disciples = newState.teams.blue.disciples.filter((u) => u.id !== currentUser.id);

        if (newState.teams.red.sage?.id === currentUser.id) {
          newState.teams.red.sage = null;
        }
        if (newState.teams.blue.sage?.id === currentUser.id) {
          newState.teams.blue.sage = null;
        }

        // Ajouter à la nouvelle position
        const updatedUser = { ...currentUser, team, role };
        if (role === 'sage') {
          newState.teams[team].sage = updatedUser;
        } else {
          newState.teams[team].disciples.push(updatedUser);
        }

        return newState;
      });

      // Ajouter un message système
      const teamName = team === 'red' ? 'Rouge' : 'Bleue';
      const roleName = role === 'sage' ? 'Sage' : 'Disciple';
      const newMessage: DemoMessage = {
        id: Date.now().toString(),
        username: 'Système',
        message: `${currentUser.username} est devenu ${roleName} de l'équipe ${teamName}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      setIsJoiningTeam(false);
    }, 1000);
  };

  const joinSpectator = () => {
    setIsJoiningTeam(true);

    setTimeout(() => {
      setGameState((prev) => {
        const newState = { ...prev };

        // Retirer l'utilisateur de sa position actuelle
        newState.teams.red.disciples = newState.teams.red.disciples.filter((u) => u.id !== currentUser.id);
        newState.teams.blue.disciples = newState.teams.blue.disciples.filter((u) => u.id !== currentUser.id);

        if (newState.teams.red.sage?.id === currentUser.id) {
          newState.teams.red.sage = null;
        }
        if (newState.teams.blue.sage?.id === currentUser.id) {
          newState.teams.blue.sage = null;
        }

        // Ajouter aux spectateurs
        const updatedUser = { ...currentUser, team: 'spectator' as const, role: 'spectator' as const };
        newState.spectators.push(updatedUser);

        return newState;
      });

      const newMessage: DemoMessage = {
        id: Date.now().toString(),
        username: 'Système',
        message: `${currentUser.username} est devenu spectateur`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      setIsJoiningTeam(false);
    }, 1000);
  };

  const startGame = () => {
    if (gameState.currentPhase === 0) {
      setGameState((prev) => ({
        ...prev,
        currentPhase: 1,
        isPlaying: true,
        timeRemaining: 30,
        totalTime: 30,
      }));

      const newMessage: DemoMessage = {
        id: Date.now().toString(),
        username: 'Système',
        message: 'Début de la Phase 1 - Choix du mot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const pauseGame = () => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
    }));

    const newMessage: DemoMessage = {
      id: Date.now().toString(),
      username: 'Système',
      message: 'Jeu mis en pause',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const renderUserCard = (user: DemoUser, team: string, role: string) => {
    const isCurrentUser = user.id === currentUser.id;
    const teamColor = team === 'red' ? 'red' : team === 'blue' ? 'blue' : 'gray';
    const highlight = isCurrentUser ? 'ring-2 ring-yellow-400/50' : '';
    const bgColor =
      team === 'red'
        ? 'bg-red-500/20 border-red-300/30'
        : team === 'blue'
          ? 'bg-blue-500/20 border-blue-300/30'
          : 'bg-gray-500/20 border-gray-300/30';

    return (
      <div
        className={`${bgColor} backdrop-blur-sm rounded-xl p-4 border hover:bg-opacity-30 transition-all duration-300 ${highlight}`}
      >
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

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 min-h-screen transition-all duration-1000">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 text-center font-semibold">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-5 h-5" />
          <span>MODE DÉMO - Toutes les fonctionnalités sont simulées</span>
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse opacity-5 pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            <h1
              className="text-white text-3xl font-black tracking-wider"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              KENSHO
            </h1>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
              <span className="text-white text-sm font-semibold">
                Salon : <span className="text-yellow-300 font-bold">DEMO01</span>
              </span>
            </div>
            <button
              onClick={copyRoomCode}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier URL'}</span>
            </button>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-white text-sm font-semibold">
                Admin : <span className="text-green-300 font-bold">Alice</span>
              </span>
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
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
            <button
              onClick={() => window.location.reload()}
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
                      onClick={gameState.isPlaying ? pauseGame : startGame}
                      className="text-blue-300 hover:text-white transition-colors flex items-center justify-center mr-2"
                    >
                      {gameState.isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    </button>
                    <span className="text-blue-200 text-sm font-semibold">Phase</span>
                  </div>
                  <h3 className="text-white font-bold text-sm">{gameState.phases[gameState.currentPhase]}</h3>
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
                        style={{
                          width:
                            gameState.totalTime > 0
                              ? `${((gameState.totalTime - gameState.timeRemaining) / gameState.totalTime) * 100}%`
                              : '0%',
                        }}
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
                    {gameState.score.red} - {gameState.score.blue}
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
                  <div
                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${gameState.teams.red.sage ? 'opacity-100' : 'opacity-50'}`}
                  >
                    {gameState.teams.red.sage ? (
                      renderUserCard(gameState.teams.red.sage, 'red', 'sage')
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
                    <button
                      onClick={() => joinTeam('red', 'disciple')}
                      disabled={isJoiningTeam}
                      className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-blue-300/30 hover:border-blue-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {gameState.teams.red.disciples.length === 0 ? (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                        <div className="text-center text-white/60 text-sm py-2">Aucun disciple</div>
                      </div>
                    ) : (
                      gameState.teams.red.disciples.map((disciple) => (
                        <div key={disciple.id}>{renderUserCard(disciple, 'red', 'disciple')}</div>
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

                  <div
                    className="space-y-3 h-[520px] overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {messages.map((msg) => (
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
                    ))}
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
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-300/30 text-center hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300">
                      <div className="flex items-center justify-center mb-3">
                        <Target className="w-8 h-8 text-purple-300 mr-3" />
                        <span className="text-purple-200 text-lg font-semibold">Mot à faire deviner</span>
                      </div>
                      <h4 className="text-white font-bold text-3xl tracking-wider">{gameState.currentWord}</h4>
                    </div>
                  </div>

                  {/* Forbidden Words */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-6 flex-1">
                    <div className="flex items-center mb-3">
                      <ShieldX className="w-5 h-5 text-red-300 mr-2" />
                      <span className="text-white font-semibold">Mots interdits par l'équipe</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {gameState.forbiddenWords.map((word, index) => (
                        <div key={index} className="bg-red-500/20 border border-red-300/30 rounded-lg p-2 text-center">
                          <span className="text-red-200 font-semibold text-sm">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Game Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startGame}
                      disabled={gameState.isPlaying}
                      className="bg-green-500/20 backdrop-blur-sm hover:bg-green-500/40 text-green-200 p-4 rounded-xl font-semibold transition-all duration-300 border border-green-300/30 flex items-center justify-center space-x-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5" />
                      <span>Commencer</span>
                    </button>
                    <button
                      onClick={pauseGame}
                      disabled={!gameState.isPlaying}
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
                  <div
                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${gameState.teams.blue.sage ? 'opacity-100' : 'opacity-50'}`}
                  >
                    {gameState.teams.blue.sage ? (
                      renderUserCard(gameState.teams.blue.sage, 'blue', 'sage')
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
                    <button
                      onClick={() => joinTeam('blue', 'disciple')}
                      disabled={isJoiningTeam}
                      className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-blue-300/30 hover:border-blue-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {gameState.teams.blue.disciples.length === 0 ? (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                        <div className="text-center text-white/60 text-sm py-2">Aucun disciple</div>
                      </div>
                    ) : (
                      gameState.teams.blue.disciples.map((disciple) => (
                        <div key={disciple.id}>{renderUserCard(disciple, 'blue', 'disciple')}</div>
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
                  {gameState.spectators.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                      <div className="text-center text-white/60 text-sm py-2">Aucun spectateur</div>
                    </div>
                  ) : (
                    gameState.spectators.map((spectator) => (
                      <div key={spectator.id}>{renderUserCard(spectator, 'spectator', 'spectator')}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Players Modal */}
      {showPlayersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Gestion des joueurs</h2>
                <button
                  onClick={() => setShowPlayersModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Afficher tous les joueurs */}
                {[
                  { user: { id: 'alice', username: 'Alice' }, isCreator: true },
                  { user: { id: 'diana', username: 'Diana' }, isCreator: false },
                  { user: { id: 'bob', username: 'Bob' }, isCreator: false },
                  { user: { id: 'charlie', username: 'Charlie' }, isCreator: false },
                  { user: { id: 'eve', username: 'Eve' }, isCreator: false },
                  { user: currentUser, isCreator: false },
                ].map(({ user, isCreator }, index) => {
                  const isCurrentUser = user.id === currentUser.id;
                  const bgClass = isCurrentUser ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50';

                  return (
                    <div key={user.id} className={`${bgClass} rounded-xl p-4 flex items-center justify-between`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.username}
                            {isCurrentUser ? ' (Vous)' : ''}
                          </p>
                          <p className="text-gray-600 text-sm">{isCreator ? 'Créateur du salon' : 'Participant'}</p>
                        </div>
                      </div>
                      {isCreator && <Crown className="w-5 h-5 text-yellow-500" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Paramètres de la partie</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Reset Button */}
              <div className="mb-6">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105">
                  <RefreshCw className="w-5 h-5" />
                  <span>Réinitialiser la partie</span>
                </button>
              </div>

              {/* Settings Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Time Management */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Gestion du temps</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Temps phase 1 :</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="30" selected>
                          30s
                        </option>
                        <option value="45">45s</option>
                        <option value="60">60s</option>
                        <option value="90">90s</option>
                        <option value="120">120s</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Temps phase 2 :</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="60">60s</option>
                        <option value="90" selected>
                          90s
                        </option>
                        <option value="120">120s</option>
                        <option value="150">150s</option>
                        <option value="180">180s</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Temps phase 3 :</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="30">30s</option>
                        <option value="60">60s</option>
                        <option value="90">90s</option>
                        <option value="120" selected>
                          120s
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Word Types */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Types de mots</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 rounded" />
                      <span className="text-gray-700 font-medium">Mots très courants</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 rounded" />
                      <span className="text-gray-700 font-medium">Mots moins courants</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded" />
                      <span className="text-gray-700 font-medium">Mots rarement courants</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Validate Button */}
              <div className="mt-6 text-center">
                <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                  Valider et réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">© 2025 Kensho – Mode démo pour tests et design</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoMode;
