export interface User {
  id: string;
  username: string;
  room: string;
}

export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

export interface Room {
  code: string;
  users: User[];
  messages: Message[];
}

export interface ServerToClientEvents {
  roomJoined: (room: Room) => void;
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  newMessage: (message: Message) => void;
  roomNotFound: () => void;
  usernameTaken: () => void;
  usersUpdate: (users: User[]) => void;
}

export interface ClientToServerEvents {
  createRoom: (username: string) => void;
  joinRoom: (username: string, roomCode: string) => void;
  sendMessage: (message: string) => void;
  disconnect: () => void;
}