// --------------- IMPORT
import { SocketType } from '../../types';

// --------------- Hook pour gérer les actions liées aux équipes
export function useRoomTeamActions(
  socket: SocketType | null,
  setIsJoiningTeam: (value: boolean) => void,
  setTeamJoinError: (error: string | null) => void
) {
  // Rejoindre une équipe
  const joinTeam = (team: 'red' | 'blue' | 'spectator', role: 'sage' | 'disciple' | 'spectator') => {
    if (!socket) {
      console.log('Client: No socket connection');
      setTeamJoinError('Connexion au serveur perdue');
      return;
    }

    console.log('Client: Attempting to join team:', team, role);
    setIsJoiningTeam(true);
    setTeamJoinError(null);

    socket.emit('joinTeam', team, role);

    // Timeout au cas où pas de réponse
    setTimeout(() => {
      setIsJoiningTeam(false);
    }, 5000);
  };

  // Rejoindre les spectateurs
  const joinSpectator = () => {
    joinTeam('spectator', 'spectator');
  };

  // Changer le rôle d'un utilisateur (Admin seulement)
  const handleChangeUserRole = (userToken: string, newRole: string, isAdmin: boolean) => {
    if (!socket) {
      setTeamJoinError('Connexion au serveur perdue');
      return;
    }

    if (!isAdmin) {
      setTeamJoinError('Vous devez être Admin pour changer les rôles');
      setTimeout(() => setTeamJoinError(null), 3000);
      return;
    }

    console.log('Emitting changeUserRoomRole event');
    socket.emit('changeUserRoomRole', userToken, newRole);
  };

  // Expulser un utilisateur (Admin seulement)
  const handleKickUser = (userToken: string, reason: string, isAdmin: boolean) => {
    if (!socket) {
      setTeamJoinError('Connexion au serveur perdue');
      return;
    }

    if (!isAdmin) {
      setTeamJoinError('Vous devez être Admin pour expulser des utilisateurs');
      setTimeout(() => setTeamJoinError(null), 3000);
      return;
    }

    console.log('Attempting to kick user:', userToken, reason);
    socket.emit('kickUser', userToken, reason);
  };

  // Bannir un utilisateur (Admin seulement)
  const handleBanUser = (userToken: string, reason: string, isAdmin: boolean) => {
    if (!socket) {
      setTeamJoinError('Connexion au serveur perdue');
      return;
    }

    if (!isAdmin) {
      setTeamJoinError('Vous devez être Admin pour bannir des utilisateurs');
      setTimeout(() => setTeamJoinError(null), 3000);
      return;
    }

    console.log('Attempting to ban user:', userToken, reason);
    socket.emit('banUser', userToken, reason);
  };

  return {
    joinTeam,
    joinSpectator,
    handleChangeUserRole,
    handleKickUser,
    handleBanUser,
  };
}
