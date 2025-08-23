// --------------- IMPORT
import { SocketType } from '../../types';

// --------------- Hook pour gérer les actions de jeu
export function useRoomGameActions(socket: SocketType | null, handleSendMessage: (message: string) => void) {
  // Démarrer la partie
  const startGame = () => {
    if (!socket) {
      console.log('No socket connection for starting game');
      return;
    }

    handleSendMessage('Début de la Phase 1 - Choix du mot');
    socket.emit('startGame');
  };

  // Mettre en pause la partie
  const pauseGame = () => {
    if (!socket) {
      console.log('No socket connection for pausing game');
      return;
    }

    handleSendMessage('Jeu mis en pause');
    socket.emit('pauseGame');
  };

  // Reprendre la partie
  const resumeGame = () => {
    if (!socket) {
      console.log('No socket connection for resuming game');
      return;
    }

    handleSendMessage('Jeu repris');
    socket.emit('resumeGame');
  };

  // Réinitialiser la partie
  const resetGame = () => {
    if (!socket) {
      console.log('No socket connection for resetting game');
      return;
    }

    handleSendMessage("La partie a été réinitialisée par l'Admin");
    socket.emit('resetGame');
  };

  // Envoyer une proposition
  const sendProposal = (proposal: string, clearProposal: () => void) => {
    if (!proposal.trim()) return;

    handleSendMessage(`[Proposition] ${proposal.trim()}`);
    clearProposal();
  };

  // Actions de debug (pour le développement)
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

  return {
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    sendProposal,
    sendPing,
    requestDebugInfo,
  };
}
