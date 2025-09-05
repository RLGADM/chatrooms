// --------------- IMPORT
import React from 'react';
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
import { User } from '../types';

// --------------- Composant RoomCreated refactorisé
const RoomCreated: React.FC = () => {
  // Hook principal qui gère toute la logique
  const {
    // Données
    currentUser,
    currentRoom,
    permissions,

    // États UI
    proposal,
    copied,
    showPlayersModal,
    showResetModal,
    teamJoinError,
    isJoiningTeam,
    historyEndRef,

    // Setters
    setProposal,
    setShowPlayersModal,
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
    handleChangeUserRole,
    handleKickUser,
    handleBanUser,
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
  const isGameActive = gameState?.Status !== 0;
  const redTeam = currentRoom.users.filter((user) => user.team === 'red');
  const blueTeam = currentRoom.users.filter((user) => user.team === 'blue');
  const spectators = currentRoom.users.filter((user) => user.team === 'spectator');

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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left Side - Game Title and Room Info */}
            <div className="flex items-center space-x-4">
              <h1
                className="text-white text-3xl font-black tracking-wider"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                KENSHO
              </h1>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                <span className="text-white text-sm font-semibold">
                  Salon : <span className="text-yellow-300 font-bold">{currentRoom.code}</span>
                </span>
              </div>
              <button
                onClick={copyRoomLink}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : 'Copier le Code'}</span>
              </button>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <span className="text-white text-sm font-semibold">
                  <Users className="w-4 h-4 inline mr-1" />
                  {currentRoom.users.length} joueurs
                </span>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-4">
              {permissions.canControlGame && (
                <button
                  onClick={() => setShowResetModal(true)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Relancer la partie</span>
                </button>
              )}
              {permissions.isAdmin && (
                <button
                  onClick={() => setShowPlayersModal(true)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-white/30 flex items-center space-x-2 hover:scale-105"
                >
                  <Users className="w-4 h-4" />
                  <span>Joueurs</span>
                </button>
              )}
              <button
                onClick={handleLeaveRoom}
                className="bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span>Quitter</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      {gameState && (
        <div className="relative z-10 px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* Phase de jeu */}
                <div className="col-span-1">
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-3 border border-blue-300/30 text-center hover:bg-blue-500/30 transition-all duration-300">
                    <div className="flex items-center justify-center mb-2">
                      <button
                        onClick={isGameActive ? pauseGame : startGame}
                        disabled={!permissions.canControlGame}
                        className="text-blue-300 hover:text-white transition-colors flex items-center justify-center mr-2"
                      >
                        {isGameActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                      </button>
                      <span className="text-blue-200 text-sm font-semibold">Phase</span>
                    </div>
                    <h3 className="text-white font-bold text-sm">
                      {gameState.currentPhase === 0 ? 'En attente' : `Phase ${gameState.currentPhase}`}
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
                      <h3 className="text-white font-bold text-xl">{formatTimer(gameState.timer || 0)}</h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-green-400 to-red-500"
                          style={{
                            width: gameState.timer ? `${Math.max(0, 100 - (gameState.timer / 300) * 100)}%` : '0%',
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
                      {redTeam.length} - {blueTeam.length}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    {redTeam.find((user) => user.role === 'sage') ? (
                      renderUserCard(redTeam.find((user) => user.role === 'sage')!)
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
                    {redTeam.filter((user) => user.role === 'disciple').length === 0 ? (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                        <div className="text-center text-white/60 text-sm py-2">Aucun disciple</div>
                      </div>
                    ) : (
                      redTeam
                        .filter((user) => user.role === 'disciple')
                        .map((disciple) => <div key={disciple.userToken}>{renderUserCard(disciple)}</div>)
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Columns: Game Area */}
            <div className="lg:col-span-3">
              {/* Proposal Input */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 mb-6 hover:bg-white/15 transition-all duration-300">
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
                    {!currentRoom?.messages || currentRoom.messages.length === 0 ? (
                      <div className="text-center text-white/60 py-12">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Aucun message pour le moment</p>
                        <p className="text-sm">L'historique apparaîtra ici</p>
                      </div>
                    ) : (
                      currentRoom.messages.map((msg) => (
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
                  {permissions.canControlGame && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={startGame}
                        disabled={isGameActive}
                        className="bg-green-500/20 backdrop-blur-sm hover:bg-green-500/40 text-green-200 p-4 rounded-xl font-semibold transition-all duration-300 border border-green-300/30 flex items-center justify-center space-x-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-5 h-5" />
                        <span>Commencer</span>
                      </button>
                      <button
                        onClick={pauseGame}
                        disabled={!isGameActive}
                        className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/40 text-red-200 p-4 rounded-xl font-semibold transition-all duration-300 border border-red-300/30 flex items-center justify-center space-x-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Pause className="w-5 h-5" />
                        <span>Pause</span>
                      </button>
                    </div>
                  )}
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
                    {blueTeam.find((user) => user.role === 'sage') ? (
                      renderUserCard(blueTeam.find((user) => user.role === 'sage')!)
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
                    {blueTeam.filter((user) => user.role === 'disciple').length === 0 ? (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                        <div className="text-center text-white/60 text-sm py-2">Aucun disciple</div>
                      </div>
                    ) : (
                      blueTeam
                        .filter((user) => user.role === 'disciple')
                        .map((disciple) => <div key={disciple.userToken}>{renderUserCard(disciple)}</div>)
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
                  {(!currentUser.team || currentUser.team !== 'spectator') && (
                    <button
                      onClick={joinSpectator}
                      disabled={isJoiningTeam}
                      className="bg-gray-500/20 hover:bg-gray-500/40 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-gray-300/30 hover:border-gray-300/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoiningTeam ? 'En cours...' : 'Rejoindre'}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {spectators.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 opacity-50">
                      <div className="text-center text-white/60 text-sm py-2">Aucun spectateur</div>
                    </div>
                  ) : (
                    spectators.map((spectator) => <div key={spectator.userToken}>{renderUserCard(spectator)}</div>)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
};

export default RoomCreated;
