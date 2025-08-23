// --------------- IMPORT
import { useEffect } from 'react';
import { useRoomEvents } from '../global';
import { useRoomUIStates } from './useRoomUIStates';
import { useRoomUtils } from './useRoomUtils';
import { useRoomTeamActions } from './useRoomTeamActions';
import { useRoomGameActions } from './useRoomGameActions';

// --------------- Hook principal pour RoomCreated
export function useRoomCreatedMain() {
  // Hook principal de la room (depuis votre architecture globale)
  const { socket, currentUser, currentRoom, handleSendMessage, leaveRoom, hasJoinedRoomRef, hasRejoinAttempted } =
    useRoomEvents();

  // États UI
  const uiStates = useRoomUIStates();

  // Utilitaires
  const utils = useRoomUtils();

  // Actions d'équipes
  const teamActions = useRoomTeamActions(socket, uiStates.setIsJoiningTeam, uiStates.setTeamJoinError);

  // Actions de jeu
  const gameActions = useRoomGameActions(socket, handleSendMessage);

  // Effet pour auto-scroll des messages
  useEffect(() => {
    if (uiStates.historyEndRef.current) {
      uiStates.historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentRoom?.messages]);

  // Effet pour nettoyer l'état isJoiningTeam quand l'utilisateur rejoint effectivement une équipe
  useEffect(() => {
    if (currentUser && currentUser.team) {
      uiStates.setIsJoiningTeam(false);
      uiStates.clearTeamJoinError();
    }
  }, [currentUser?.team]);

  // Permissions utilisateur
  const permissions = currentUser ? utils.checkPermissions(currentUser) : { isAdmin: false, canControlGame: false };

  // Actions combinées avec les utilitaires
  const enhancedActions = {
    ...gameActions,
    ...teamActions,

    // Action pour copier le lien avec gestion de l'état
    copyRoomLink: () => {
      if (currentRoom?.code) {
        utils.copyRoomLink(currentRoom.code, uiStates.setCopied);
      }
    },

    // Envoyer proposition avec nettoyage automatique
    sendProposal: () => {
      gameActions.sendProposal(uiStates.proposal, uiStates.clearProposal);
    },

    // Quitter la room avec nettoyage
    handleLeaveRoom: () => {
      leaveRoom();
      hasJoinedRoomRef.current = false;
      hasRejoinAttempted.current = false;
      localStorage.removeItem('lastRoomCode');
    },

    // Gérer reset avec fermeture de modal
    handleResetGame: () => {
      gameActions.resetGame();
      uiStates.setShowResetModal(false);
    },
  };

  return {
    // Données de base
    socket,
    currentUser,
    currentRoom,
    permissions,

    // États UI
    ...uiStates,

    // Utilitaires
    ...utils,

    // Actions
    ...enhancedActions,
  };
}
