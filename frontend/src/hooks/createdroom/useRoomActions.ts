//TODO
// Tu dois juste t’assurer que :
// Quand l’utilisateur clique sur "Quitter", tu fais :

// ts
// Copier
// Modifier
// localStorage.setItem('hasLeftRoom', 'true');
// localStorage.removeItem('lastRoomCode');
// localStorage.removeItem('userToken');
// Et quand il rejoint une room :

// ts
// Copier
// Modifier
// localStorage.setItem('lastRoomCode', roomCode);
// localStorage.setItem('userToken', username);
// localStorage.removeItem('hasLeftRoom'); // au cas où
//+
//TODO sur le bouton quitter
// localStorage.setItem('hasLeftRoom', 'true');
// localStorage.removeItem('lastRoomCode'); // plus besoin de tenter de rejoindre une room
