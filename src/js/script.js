// Configuration
const LASTFM_API_KEY = 'f4d0005229540c63b661072864d3994d'; // Last.fm API keys are client-side by design (read-only, public data)
const LASTFM_USERNAME = 'coldpolaris';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const quotes = [
    { text: "We don't see things as they are, we see them as we are.", author: "Anaïs Nin" },
    { text: "We write to taste life twice, in the moment and in retrospect.", author: "Anaïs Nin" },
    { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
    { text: "And the day came when the risk to remain tight in a bud was more painful than the risk it took to blossom.", author: "Anaïs Nin" },
    { text: "Each friend represents a world in us, a world possibly not born until they arrive.", author: "Anaïs Nin" },
    { text: "Throw your dreams into space like a kite, and you do not know what it will bring back.", author: "Anaïs Nin" },
    { text: "People living deeply have no fear of death.", author: "Anaïs Nin" },
    { text: "Dreams are necessary to life.", author: "Anaïs Nin" },
    { text: "The personal life deeply lived always expands into truths beyond itself.", author: "Anaïs Nin" },
    { text: "We travel, some of us forever, to seek other states, other lives, other souls.", author: "Anaïs Nin" },
    { text: "There are many ways to be free. One of them is to transcend reality by imagination.", author: "Anaïs Nin" },
    { text: "The possession of knowledge does not kill the sense of wonder and mystery.", author: "Anaïs Nin" },
    { text: "What we call our destiny is truly our character and that character can be altered.", author: "Anaïs Nin" },
    { text: "I must be a mermaid. I have no fear of depths and a great fear of shallow living.", author: "Anaïs Nin" },
    { text: "Less, but better.", author: "Dieter Rams" },
    { text: "Indifference towards people and the reality in which they live is actually the one and only cardinal sin in design.", author: "Dieter Rams" },
    { text: "The details are not the details. They make the design.", author: "Charles Eames" },
    { text: "Eventually everything connects — people, ideas, objects.", author: "Charles Eames" },
    { text: "In all my works, light is an important controlling factor.", author: "Tadao Ando" },
];

// Initialize quotes with fade cycling (static single quote under prefers-reduced-motion)
function initQuotes() {
    let currentIndex = Math.floor(Math.random() * quotes.length);

    const quoteContainer = document.createElement('div');
    quoteContainer.className = 'quote-container';
    // data-nosnippet keeps decorative quotes out of Google search snippets
    quoteContainer.setAttribute('data-nosnippet', '');

    const quoteEl = document.createElement('p');
    quoteEl.className = 'quote-text';

    function renderQuote(index) {
        quoteEl.textContent = `"${quotes[index].text}"`;
        const attribution = document.createElement('span');
        attribution.className = 'quote-attribution';
        attribution.textContent = `— ${quotes[index].author}`;
        quoteEl.appendChild(attribution);
    }

    renderQuote(currentIndex);
    quoteContainer.appendChild(quoteEl);

    const content = document.querySelector('.content');
    if (content) {
        content.appendChild(quoteContainer);
    }

    if (prefersReducedMotion.matches) return;

    setInterval(() => {
        quoteEl.style.opacity = '0';
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % quotes.length;
            renderQuote(currentIndex);
            quoteEl.style.opacity = '1';
        }, 1600);
    }, 16000);
}

// Last.fm API integration
let lastRenderedTrack = null;

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
        const isPlaying = track && track['@attr'] && track['@attr'].nowplaying;

        if (!isPlaying) {
            document.getElementById('music-status').style.display = 'none';
            lastRenderedTrack = null;
            return;
        }

        const artist = track.artist['#text'];
        const song = track.name;
        const albumImage = track.image && track.image[2] ? track.image[2]['#text'] : '';

        document.getElementById('music-status').style.display = 'block';

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
            img.width = 56;
            img.height = 56;
            trackInfo.appendChild(img);
        }
        const text = document.createElement('span');
        text.className = 'track-text';
        text.textContent = `${artist} - ${song}`;
        trackInfo.appendChild(text);
    } catch {
        document.getElementById('music-status').style.display = 'none';
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

        const weatherElement = document.querySelector('#weather-info');
        if (weatherElement) {
            weatherElement.textContent = '';
            const emoji = document.createElement('span');
            emoji.setAttribute('aria-hidden', 'true');
            emoji.textContent = getWeatherEmoji(current.shortForecast);
            weatherElement.appendChild(emoji);
            weatherElement.appendChild(
                document.createTextNode(` ${current.temperature}°F, ${current.shortForecast}`)
            );
        }
    } catch {
        const weatherElement = document.querySelector('#weather-info');
        if (weatherElement) {
            weatherElement.textContent = 'Weather unavailable';
        }
    }
}

// Weather emoji mapping
function getWeatherEmoji(description) {
    const desc = description.toLowerCase();
    if (desc.includes('sunny') || desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('storm')) return '⛈️';
    return '🌤️';
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

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initQuotes();
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
