export interface User {
  id: string;
  username: string;
  room: string;
  team?: 'red' | 'blue' | 'spectator';
  role?: 'sage' | 'disciple' | 'spectator';
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
  debugUsersResponse: (data: any) => void;
}

export interface ClientToServerEvents {
  createRoom: (username: string) => void;
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
}