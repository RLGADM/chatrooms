// src/utils/roomUtils.ts
// choix de supprimer ce fichier car inutile.

// import { Socket } from "socket.io-client";
// import { User} from '../types';

// export function handleJoinRoom(
//   socket: Socket,
//   username: string,
//   roomCode: string,
//   setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>,
//   setInRoom: React.Dispatch<React.SetStateAction<boolean>>,
//   setError: React.Dispatch<React.SetStateAction<string | null>>
// ) {
//   if (!username || !roomCode) {
//     setError("Pseudo et code requis");
//     return;
//   }

//   socket.emit("joinRoom", { username, roomCode });
//   // Tu peux stocker dans le cookie ici si tu veux aussi :
//   document.cookie = `roomCode=${roomCode}; path=/; max-age=86400`;
// }
