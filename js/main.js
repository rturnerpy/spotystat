const CLIENT_ID = 'd696741353be48ccba524fa9815cae5e';
const CLIENT_SECRET = '642c7d52b57f44c898b4028da411ff77';
const REDIRECT_URI = 'https://janqueraltp.github.io/spotystat/';

let accessToken;

const loginButton = document.getElementById('login-button');
const mostListenedArtist = document.getElementById('most-listened-artist');
const mostListenedSong = document.getElementById('most-listened-song');
const topSongs = document.getElementById('top-songs');

// Función para obtener el token de acceso utilizando el código de autorización
function getToken(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  }).then(response => response.json())
    .then(data => data.access_token);
}

// Función para obtener los datos del usuario
function getUserData() {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return Promise.all([
    fetch('https://api.spotify.com/v1/me/top/artists', options),
    fetch('https://api.spotify.com/v1/me/top/tracks', options),
  ]).then(([artistsResponse, tracksResponse]) => Promise.all([artistsResponse.json(), tracksResponse.json()]))
    .then(([artistsData, tracksData]) => {
      const mostListenedArtistData = artistsData.items[0];
      const mostListenedSongData = tracksData.items[0];

      mostListenedArtist.textContent = `${mostListenedArtistData.name} (${mostListenedArtistData.popularity} de popularidad)`;
      mostListenedSong.textContent = `${mostListenedSongData.name} - ${mostListenedSongData.artists[0].name} (${mostListenedSongData.popularity} de popularidad)`;

      const topSongsData = tracksData.items.slice(0, 5);

      topSongsData.forEach(songData => {
        const song = document.createElement('li');
        song.textContent = `${songData.name} - ${songData.artists[0].name} (${songData.popularity} de popularidad)`;
        topSongs.appendChild(song);
      });

      document.getElementById('main').style.display = 'block';
    });
}

// Función para iniciar sesión en Spotify
function login() {
  const scopes = ['user-top-read'];
  const state = 'some-state-of-my-choice';

  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', scopes.join(' '));
  url.searchParams.set('state', state);

  window.location.href = url.toString();
}

// Función principal
function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    getToken(code)
      .then(token => {
        accessToken = token;
        window.history.replaceState({}, '', '/');
        return getUserData();
      });
  } else {
    loginButton.addEventListener('click', login);
  }
}

main();
