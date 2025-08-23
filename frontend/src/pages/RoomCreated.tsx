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
    renderUserCard,

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
  const isGameActive = gameState?.currentPhase !== 0;
  const redTeam = currentRoom.users.filter((user) => user.team === 'red');
  const blueTeam = currentRoom.users.filter((user) => user.team === 'blue');
  const spectators = currentRoom.users.filter((user) => user.team === 'spectator');

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
          {/* Left Side - Room Info */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h1 className="text-2xl font-bold text-white mb-2">Room {currentRoom.code}</h1>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Users className="w-4 h-4" />
                <span>{currentRoom.users.length} joueurs connectés</span>
              </div>
            </div>

            {/* Copy Room Link */}
            <button
              onClick={copyRoomLink}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/30 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
            </button>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-3">
            {/* Game Controls (Admin only) */}
            {permissions.canControlGame && (
              <div className="flex items-center space-x-2">
                {!isGameActive ? (
                  <button
                    onClick={startGame}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-300/30 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Démarrer</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseGame}
                    className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-300/30 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <PauseCircle className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={() => setShowResetModal(true)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            )}

            {/* Players Management (Admin only) */}
            {permissions.isAdmin && (
              <button
                onClick={() => setShowPlayersModal(true)}
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-300/30 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Gérer</span>
              </button>
            )}

            {/* Leave Room */}
            <button
              onClick={handleLeaveRoom}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Teams */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teams Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Red Team */}
              <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-300/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Target className="w-5 h-5 text-red-400" />
                    <span>Équipe Rouge</span>
                  </h3>
                  <span className="text-red-300 text-sm">{redTeam.length} joueurs</span>
                </div>

                <div className="space-y-3 mb-4">
                  {redTeam.map((user) => {
                    const cardData = renderUserCard(user, currentUser.userToken);
                    return (
                      <div
                        key={user.userToken}
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
                  })}
                </div>

                {/* Join Red Team Buttons */}
                {(!currentUser.team || currentUser.team === 'spectator') && (
                  <div className="space-y-2">
                    <button
                      onClick={() => joinTeam('red', 'sage')}
                      disabled={isJoiningTeam}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-white py-2 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Rejoindre comme Sage</span>
                    </button>
                    <button
                      onClick={() => joinTeam('red', 'disciple')}
                      disabled={isJoiningTeam}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-white py-2 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Users className="w-4 h-4" />
                      <span>Rejoindre comme Disciple</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Blue Team */}
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-300/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <ShieldX className="w-5 h-5 text-blue-400" />
                    <span>Équipe Bleue</span>
                  </h3>
                  <span className="text-blue-300 text-sm">{blueTeam.length} joueurs</span>
                </div>

                <div className="space-y-3 mb-4">
                  {blueTeam.map((user) => {
                    const cardData = renderUserCard(user, currentUser.userToken);
                    return (
                      <div
                        key={user.userToken}
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
                  })}
                </div>

                {/* Join Blue Team Buttons */}
                {(!currentUser.team || currentUser.team === 'spectator') && (
                  <div className="space-y-2">
                    <button
                      onClick={() => joinTeam('blue', 'sage')}
                      disabled={isJoiningTeam}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/30 text-white py-2 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Rejoindre comme Sage</span>
                    </button>
                    <button
                      onClick={() => joinTeam('blue', 'disciple')}
                      disabled={isJoiningTeam}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/30 text-white py-2 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Users className="w-4 h-4" />
                      <span>Rejoindre comme Disciple</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Spectators */}
            {spectators.length > 0 && (
              <div className="bg-gray-500/10 backdrop-blur-sm rounded-xl p-6 border border-gray-300/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <span>Spectateurs</span>
                  </h3>
                  <span className="text-gray-300 text-sm">{spectators.length} spectateurs</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {spectators.map((user) => {
                    const cardData = renderUserCard(user, currentUser.userToken);
                    return (
                      <div
                        key={user.userToken}
                        className={`${cardData.bgColor} backdrop-blur-sm rounded-xl p-4 border hover:bg-opacity-30 transition-all duration-300 ${cardData.highlight}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 bg-${cardData.teamColor}-500 rounded-full flex items-center justify-center shadow-lg`}
                          >
                            <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{user.username}</p>
                            <p className="text-white/60 text-xs">{cardData.isCurrentUser ? 'Vous' : 'Spectateur'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Join Spectators Button */}
            {(!currentUser.team || currentUser.team !== 'spectator') && (
              <button
                onClick={joinSpectator}
                disabled={isJoiningTeam}
                className="w-full bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/30 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                <span>Devenir Spectateur</span>
              </button>
            )}
          </div>

          {/* Right Column - Chat & Game Info */}
          <div className="space-y-6">
            {/* Game Status */}
            {gameState && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5" />
                  <span>État du Jeu</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Phase:</span>
                    <span className="text-white font-semibold">
                      {gameState.currentPhase === 0 ? 'En attente' : `Phase ${gameState.currentPhase}`}
                    </span>
                  </div>

                  {gameState.timer !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Timer:</span>
                      <span className="text-white font-semibold flex items-center space-x-1">
                        <Timer className="w-4 h-4" />
                        <span>{formatTimer(gameState.timer)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex flex-col h-96">
              <div className="p-4 border-b border-white/20">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Chat de la Room</span>
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentRoom.messages.map((message, index) => (
                  <div key={message.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white font-semibold text-sm">{message.username}</span>
                      <span className="text-white/60 text-xs">{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="text-white/90 text-sm">{message.message}</p>
                  </div>
                ))}
                <div ref={historyEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendProposal()}
                    placeholder="Tapez votre message..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={sendProposal}
                    disabled={!proposal.trim()}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/30 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Envoyer
                  </button>
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
