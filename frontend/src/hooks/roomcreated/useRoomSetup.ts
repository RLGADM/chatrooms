import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { useSocket } from '@/context/SocketContext';
//import { useAuth } from '@/context/AuthContext';
//import { useGameContext } from '@/context/GameContext';
//import { useToast } from '@/components/ui/use-toast';
import { GameState, RoleType, TeamType, UserType } from '@/types';
//import { copyToClipboard } from '@/utils/copyToClipboard';

export function useRoomSetup() {
  const { socket } = useSocket();
  const { userToken } = useAuth();
  const { toast } = useToast();
  const { gameState, setGameState } = useGameContext();
  const navigate = useNavigate();

  // Refs
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  // States
  const [proposal, setProposal] = useState('');
  const [copied, setCopied] = useState(false);
  const [teamJoinError, setTeamJoinError] = useState('');
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);

  // === Socket listeners ===
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (user: UserType) => {
      // TODO: gérer l'ajout d'un utilisateur
    };

    const handleUserLeft = (userId: string) => {
      // TODO: gérer la sortie d’un utilisateur
    };

    const handleGameStateUpdate = (newGameState: GameState) => {
      setGameState(newGameState);
    };

    const handleServerReset = () => {
      // TODO: logique quand le serveur reset
    };

    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('gameStateUpdate', handleGameStateUpdate);
    socket.on('serverReset', handleServerReset);

    return () => {
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('serverReset', handleServerReset);
    };
  }, [socket, setGameState]);

  // === Join Team ===
  const joinTeam = (team: TeamType, role: RoleType) => {
    if (!socket || !userToken || isJoiningTeam) return;

    setIsJoiningTeam(true);
    socket.emit('joinTeam', { token: userToken, team, role });

    setTimeout(() => {
      setIsJoiningTeam(false);
    }, 2000);
  };

  const joinSpectator = () => {
    if (!socket || !userToken) return;
    socket.emit('joinSpectator', { token: userToken });
  };

  // === Game actions ===
  const startGame = () => {
    if (!socket || !userToken) return;
    socket.emit('startGame', { token: userToken });
  };

  const pauseGame = () => {
    if (!socket || !userToken) return;
    socket.emit('pauseGame', { token: userToken });
  };

  // === Clipboard ===
  const copyRoomLink = (roomCode: string) => {
    copyToClipboard(window.location.origin + '/room/' + roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // === Proposals ===
  const handleSubmitProposal = () => {
    if (!socket || !userToken || !proposal.trim()) return;
    socket.emit('sendProposal', { token: userToken, proposal });
    setProposal('');
  };

  return {
    proposal,
    setProposal,
    copied,
    copyRoomLink,
    teamJoinError,
    isJoiningTeam,
    joinTeam,
    joinSpectator,
    startGame,
    pauseGame,
    handleSubmitProposal,
    gameState,
    historyEndRef,
  };
}
