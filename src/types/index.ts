export type RoomRole = 'Admin' | 'Héraut' | 'Débutant';

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

export interface User {
  id: string;
  username: string;
  room: string;
  team?: 'red' | 'blue' | 'spectator';
  role?: 'sage' | 'disciple' | 'spectator';
  roomRole?: RoomRole;
}

export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

export interface GameState {
  currentPhase: number;
  phases: string[];
  teams: {
    red: { sage: User | null; disciples: User[] };
    blue: { sage: User | null; disciples: User[] };
  };
  spectators: User[];
  timer: number | null;
  timeRemaining: number;
  totalTime: number;
  isPlaying: boolean;
  score: { red: number; blue: number };
}

export interface Room {
  code: string;
  users: User[];
  messages: Message[];
  gameState?: GameState;
  gameParameters?: GameParameters;
  creator: string; // ID du créateur
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
  roomRoleChanged: (data: { userId: string; newRole: RoomRole }) => void;
  userKicked: (data: { userId: string; reason: string }) => void;
  userBanned: (data: { userId: string; reason: string }) => void;
}

export interface ClientToServerEvents {
  //chat pour params
  createRoom: (payload: {
  username: string;
  gameMode: 'standard' | 'custom';
  parameters: GameParameters;
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
  changeUserRoomRole: (userId: string, newRole: RoomRole) => void;
  kickUser: (userId: string, reason: string) => void;
  banUser: (userId: string, reason: string) => void;
}