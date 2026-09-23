// Configuration
const LASTFM_API_KEY = 'f4d0005229540c63b661072864d3994d'; // Last.fm API keys are client-side by design (read-only, public data)
const LASTFM_USERNAME = 'coldpolaris';

// Last.fm API integration
let lastRenderedTrack = null;

function timeAgo(ms) {
    const minutes = Math.max(0, Math.round((Date.now() - ms) / 60000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'yesterday' : `${days} days ago`;
}

async function getCurrentTrack() {
    try {
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Last.fm data');
        }

        const data = await response.json();
        const track = data.recenttracks.track[0];
        if (!track) throw new Error('No recent tracks');
        const isPlaying = Boolean(track['@attr'] && track['@attr'].nowplaying);
        const playedAt = !isPlaying && track.date ? Number(track.date.uts) * 1000 : null;

        const artist = track.artist['#text'];
        const song = track.name;
        const albumImage = track.image && track.image[2] ? track.image[2]['#text'] : '';

        // Between songs, show the last one with how long ago it played
        const label = document.getElementById('music-label');
        label.textContent = '';
        if (isPlaying) {
            const eq = document.createElement('span');
            eq.className = 'eq';
            eq.setAttribute('aria-hidden', 'true');
            eq.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
            label.append(eq, 'Currently listening');
        } else {
            label.textContent = playedAt ? `Last played ${timeAgo(playedAt)}` : 'Last played';
        }

        // Coming back after a failed load: show the block again and let the page refit around it
        const status = document.getElementById('music-status');
        const wasHidden = status.hidden;
        status.hidden = false;
        status.classList.add('loaded');
        if (wasHidden && window.fitPage) window.fitPage();

        // Skip the DOM rewrite when the track hasn't changed (no churn between polls)
        const trackKey = `${artist} - ${song} - ${albumImage}`;
        if (trackKey === lastRenderedTrack) return;
        lastRenderedTrack = trackKey;

        const trackInfo = document.getElementById('track-info');
        trackInfo.textContent = '';
        if (albumImage) {
            const img = document.createElement('img');
            img.src = albumImage;
            img.alt = `Album cover for ${song} by ${artist}`;
            img.width = 48;
            img.height = 48;
            trackInfo.appendChild(img);
        }
        const text = document.createElement('span');
        text.className = 'track-text';
        text.textContent = `${artist} - ${song}`;
        trackInfo.appendChild(text);
    } catch {
        // No track to show: give the space back instead of leaving an invisible block
        const status = document.getElementById('music-status');
        status.classList.remove('loaded');
        if (!status.hidden) {
            status.hidden = true;
            if (window.fitPage) window.fitPage();
        }
        lastRenderedTrack = null;
    }
}

// Weather via weather.gov. The points→gridpoint mapping is permanent for fixed
// coordinates (42.2808,-83.7430 → DTX/42,30), so skip the lookup round trip and
// only re-derive it if the gridpoint URL ever stops working.
let forecastUrl = 'https://api.weather.gov/gridpoints/DTX/42,30/forecast';

async function getWeather() {
    try {
        let forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            const pointResponse = await fetch('https://api.weather.gov/points/42.2808,-83.7430');
            if (!pointResponse.ok) {
                throw new Error('Failed to fetch weather grid data');
            }
            const pointData = await pointResponse.json();
            forecastUrl = pointData.properties.forecast;
            forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch weather forecast');
            }
        }

        const forecastData = await forecastResponse.json();
        const current = forecastData.properties.periods[0];
        // "Chance Showers then Mostly Sunny" -> "Chance Showers", so the line stays short
        const forecast = current.shortForecast.split(' then ')[0];

        const weatherElement = document.querySelector('#weather-info');
        if (weatherElement) {
            weatherElement.textContent = '';
            const emoji = document.createElement('span');
            emoji.setAttribute('aria-hidden', 'true');
            emoji.textContent = getWeatherEmoji(forecast, current.isDaytime);
            weatherElement.appendChild(emoji);
            weatherElement.appendChild(
                document.createTextNode(` ${current.temperature}°F, ${forecast}`)
            );
        }
    } catch {
        const weatherElement = document.querySelector('#weather-info');
        if (weatherElement) {
            weatherElement.textContent = 'Weather unavailable';
        }
    }
}

// Weather emoji mapping (most severe first, and no sun at night)
function getWeatherEmoji(description, isDaytime) {
    const desc = description.toLowerCase();
    if (desc.includes('storm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('rain') || desc.includes('shower') || desc.includes('drizzle')) return '🌧️';
    if (desc.includes('cloud') || desc.includes('fog')) return '☁️';
    if (desc.includes('sunny') || desc.includes('clear')) return isDaytime === false ? '🌙' : '☀️';
    return isDaytime === false ? '🌙' : '🌤️';
}

// Update current time in Ann Arbor (Eastern Time)
function updateTime() {
    const now = new Date();
    const options = {
        timeZone: 'America/Detroit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    };
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US', options);
    }
}

// Hovering a project link lays a print of it on top of the photo stack (desktop only)
function initPeek() {
    const peek = document.querySelector('.peek');
    if (!peek || !window.matchMedia('(min-width: 641px) and (hover: hover)').matches) return;
    const img = peek.querySelector('img');
    const caption = peek.querySelector('figcaption');
    const content = document.querySelector('main.content');
    const captions = {
        'justmonitors': 'discord, 2021',
        'watchlist-match': 'movie night',
        'photo-booth': 'the wall',
        'squarespace-checkout': 'seven requests',
    };
    let hideTimer;
    const show = (link) => {
        const slug = link.dataset.peek;
        clearTimeout(hideTimer);
        if (!img.src.endsWith(`/${slug}.webp`)) img.src = `/assets/peek/${slug}.webp`;
        caption.textContent = captions[slug] || '';
        const box = content.getBoundingClientRect();
        const top = link.getBoundingClientRect().top - box.top - peek.offsetHeight / 2;
        peek.style.top = `${Math.max(0, Math.min(top, box.height - peek.offsetHeight))}px`;
        peek.style.setProperty('--tilt', `${(Math.random() * 4 - 2).toFixed(1)}deg`);
        peek.classList.add('show');
    };
    const hide = () => {
        hideTimer = setTimeout(() => peek.classList.remove('show'), 60);
    };
    document.querySelectorAll('[data-peek]').forEach((link) => {
        link.addEventListener('mouseenter', () => show(link));
        link.addEventListener('mouseleave', hide);
        link.addEventListener('focus', () => show(link));
        link.addEventListener('blur', hide);
    });
    // Warm the prints once the page is idle so the first hover isn't blank
    const warm = () => Object.keys(captions).forEach((slug) => { new Image().src = `/assets/peek/${slug}.webp`; });
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 3000 });
    else setTimeout(warm, 1500);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initPeek();
    getCurrentTrack();
    getWeather();
    updateTime();

    // Refresh current track every 30 seconds, but not in background tabs
    setInterval(() => {
        if (!document.hidden) getCurrentTrack();
    }, 30000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) getCurrentTrack();
    });
    // Refresh weather every 10 minutes
    setInterval(getWeather, 600000);
    // Update time every minute
    setInterval(updateTime, 60000);
});
