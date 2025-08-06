import { useState, useRef } from 'react';
//import { toast } from 'react-hot-toast'; // optionnel, si tu utilises un toast
import type { GameState } from '@/types';
export interface UseRoomActionsProps {
  roomCode: string;
  username: string;
  isJoiningTeam: boolean;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setIsJoiningTeam: React.Dispatch<React.SetStateAction<boolean>>;
  setTeamJoinError: React.Dispatch<React.SetStateAction<string | null>>;
  gameState: GameState;
  joinTeam: (team: 'red' | 'blue' | 'spectator', role: 'sage' | 'disciple' | 'spectator') => void;
  leaveRoom: () => void;
  sendProposal: (proposal: string) => void;
  isAdmin: boolean;
  startGame: () => void;
  pauseGame: () => void;
}

export function useRoomActions({
  roomCode,
  username,
  isJoiningTeam,
  setUsername,
  setIsJoiningTeam,
  setTeamJoinError,
  gameState,
  joinTeam,
  leaveRoom,
  sendProposal,
  isAdmin,
  startGame,
  pauseGame,
}: UseRoomActionsProps) {
  // Local states
  const [copied, setCopied] = useState(false);
  const [proposal, setProposal] = useState('');
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  const historyEndRef = useRef<HTMLDivElement | null>(null);

  // Copier le lien du salon dans le presse-papier
  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Optionnel : afficher une erreur
        // toast.error('Erreur lors de la copie du lien');
      });
  };

  // Joindre une équipe ou rôle (wrapper pour désactiver bouton)
  const handleJoinTeam = (team: 'red' | 'blue' | 'spectator', role: 'sage' | 'disciple' | 'spectator') => {
    if (isJoiningTeam) return;
    setIsJoiningTeam(true);
    try {
      joinTeam(team, role);
      setTeamJoinError(null);
    } catch (err) {
      setTeamJoinError('Impossible de rejoindre cette équipe');
    } finally {
      setIsJoiningTeam(false);
    }
  };

  // Soumettre une proposition dans la zone de jeu
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal.trim()) {
      setTeamJoinError('La proposition ne peut pas être vide');
      return;
    }
    sendProposal(proposal.trim());
    setProposal('');
  };

  // Quitter la salle
  const handleLeaveRoom = () => {
    leaveRoom();
  };

  // Affichage d’une carte utilisateur simplifiée (à adapter selon ton code)
  const renderUserCard = (
    user: { id: string; username: string },
    team: 'red' | 'blue' | 'spectator',
    role: 'sage' | 'disciple' | 'spectator'
  ) => (
    <div className="bg-white/20 rounded-lg p-3 text-white font-semibold">
      {user.username} ({role}),
    </div>
  );

  return {
    copied,
    copyRoomLink,
    proposal,
    setProposal,
    showPlayersModal,
    setShowPlayersModal,
    handleJoinTeam,
    handleSubmitProposal,
    handleLeaveRoom,
    renderUserCard,
    historyEndRef,
    // Contrôle de la partie (boutons)
    isAdmin,
    startGame,
    pauseGame,
  };
}
