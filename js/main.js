const clientId = 'd696741353be48ccba524fa9815cae5e';
const redirectUri = 'http://localhost/spoty-stats/';

function authorizeSpotify() {
  const scope = 'user-top-read';
  const state = generateRandomString();
  localStorage.setItem('spotifyState', state);

  const url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
  window.location.href = url;
}

function generateRandomString(length = 16) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getHashParams() {
  const hash = window.location.hash.substring(1);
  const params = {};
  hash.split('&').forEach(part => {
    const [key, value] = part.split('=');
    params[key] = decodeURIComponent(value);
  });
  return params;
}

function showStats() {
  const token = localStorage.getItem('spotifyAccessToken');

  if (!token) {
    return;
  }

  const topArtistUrl = 'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=1';
  const topTrackUrl = 'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=1';

  Promise.all([
    fetch(topArtistUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch(topTrackUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  ])
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then(([topArtistResponse, topTrackResponse]) => {
    const topArtist = topArtistResponse.items[0];
    const topTrack = topTrackResponse.items[0];

    document.getElementById('top-artist').textContent = topArtist.name;
    document.getElementById('top-track').textContent = `${topTrack.name} - ${topTrack.artists[0].name}`;
    document.getElementById('stats-container').style.display = 'block';
  })
  .catch(error => {
    console.error(error);
  });
}

const hashParams = getHashParams();
const accessToken = hashParams.access_token;
const state = hashParams.state;
const savedState = localStorage.getItem('spotifyState');

if (accessToken && (state == null || state !== savedState)) {
  console.error('Error al autenticar con Spotify');
} else {
  localStorage.removeItem('spotifyState');
  localStorage.setItem('spotifyAccessToken', accessToken);
}

document.addEventListener('DOMContentLoaded', () => {
  showStats();
});
