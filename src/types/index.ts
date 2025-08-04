// Bijour les enfants
import { Socket } from 'socket.io-client';

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

// Création de la Room pour commencer
export interface Room {
  code: string;
  users: User[];
  messages: Message[];
  gameMode: 'standard' | 'custom';
  parameters: GameParameters;
  gameState?: GameState | null;
  creatorToken: string;
  createdAt: number;
  isReady: boolean;
}

// Création du joueur
export interface User {
  socketId: string;
  userToken: string;
  username: string;
  room: string;
  team?: 'red' | 'blue' | 'spectator';
  role?: 'sage' | 'disciple' | 'spectator';
  isAdmin?: boolean;
}

// le template vide pour les consts
export const emptyUser: User = {
  socketId: '',
  userToken: '',
  username: '',
  room: '',
  team: 'spectator',
  role: 'spectator',
  isAdmin: false,
};

// gestion messagerie des joueurs
export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

// Toutes les variables paramétrables
export interface GameParameters {
  ParametersTimeFirst: number;
  ParametersTimeSecond: number;
  ParametersTimeThird: number;
  ParametersTeamReroll: number;
  ParametersTeamMaxForbiddenWords: number;
  ParametersTeamMaxPropositions: number;
  ParametersPointsMaxScore: number;
  ParametersPointsRules: 'no-tie' | 'tie';
  ParametersWordsListSelection: {
    veryCommon: boolean;
    lessCommon: boolean;
    rarelyCommon: boolean;
  };
}

// Déclaration des phases petit-enfant en lien
export interface PhaseState {
  phaseIndex: number;
  name: string;
  status: 'waiting' | 'in-progress' | 'finished';
  timer: number | null;
  timeRemaining: number;
}

// Déclaration des rounds enfant en lien
export interface RoundState {
  roundIndex: number;
  phases: PhaseState[];
  currentPhase: number;
  status: 'waiting' | 'in-progress' | 'finished';
}

// Déclaration des limites de rôle par équipe
export interface TeamState {
  sage: User | null;
  disciples: User[];
  score: number;
}

// Le GameState parent
export interface GameState {
  status: 'waiting' | 'started' | 'ended';
  currentRound: number;
  rounds: RoundState[];
  teams: {
    red: TeamState;
    blue: TeamState;
  };
  spectators: User[];
  scoreToWin: number;
  isPlaying: boolean;
  winner: 'red' | 'blue' | 'draw' | null;
  createdAt: number;
}
export interface ServerToClientEvents {
  roomJoined: (room: Room) => void;
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  newMessage: (message: Message) => void;
  roomNotFound: () => void;
  usernameTaken: () => void;
  usersUpdate: (users: User[]) => void;
  gameStateUpdate: (gameState: GameState) => void;
  teamJoinSuccess: (data: { team: string; role: string; gameState: GameState }) => void;
  teamJoinError: (error: string) => void;
  pong: (data: { timestamp: string; socketId: string; userExists: boolean; userInfo: User | null }) => void;
  //debugUsersResponse: (data: any) => void;
  gameParametersSet: (parameters: GameParameters) => void;
  userKicked: (data: { userId: string; reason: string }) => void;
  userBanned: (data: { userId: string; reason: string }) => void;
}

export interface ClientToServerEvents {
  //chat pour params
  createRoom: (payload: {
    username: string;
    gameMode: 'standard' | 'custom';
    parameters: GameParameters;
    userToken?: string;
  }) => void;
  //bolt
  //createRoom: (username: string) => void;
  joinRoom: (username: string, roomCode: string) => void;
  sendMessage: (message: string) => void;
  disconnect: () => void;
  joinTeam: (team: string, role: string) => void;
  submitProposal: (proposal: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  gameError: (error: string) => void;
  ping: () => void;
  debugGetUsers: () => void;
  setGameParameters: (parameters: GameParameters) => void;
  //  changeUserRoomRole: (userId: string, newRole: RoomRole) => void;
  kickUser: (userId: string, reason: string) => void;
  banUser: (userId: string, reason: string) => void;
}

export interface ServerResetPayload {
  message: string;
}
