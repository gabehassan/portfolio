// Configuration
const LASTFM_API_KEY = 'f4d0005229540c63b661072864d3994d';
const LASTFM_USERNAME = 'coldpolaris';

// Anaïs Nin quotes
const quotes = [
    "We don't see things as they are, we see them as we are.",
    "Love never dies a natural death. It dies because we don't know how to replenish its source.",
    "We write to taste life twice, in the moment and in retrospect.",
    "Life shrinks or expands in proportion to one's courage.",
    "And the day came when the risk to remain tight in a bud was more painful than the risk it took to blossom.",
    "Each friend represents a world in us, a world possibly not born until they arrive.",
    "Reality doesn't impress me. I only believe in intoxication, in ecstasy.",
    "Throw your dreams into space like a kite, and you do not know what it will bring back.",
    "Anxiety is love's greatest killer.",
    "People living deeply have no fear of death.",
    "Dreams are necessary to life.",
    "The personal life deeply lived always expands into truths beyond itself.",
    "We travel, some of us forever, to seek other states, other lives, other souls.",
    "There are many ways to be free. One of them is to transcend reality by imagination.",
    "The possession of knowledge does not kill the sense of wonder and mystery.",
    "What we call our destiny is truly our character and that character can be altered.",
    "I must be a mermaid. I have no fear of depths and a great fear of shallow living."
];

// Initialize quotes
function initQuotes() {
    const body = document.querySelector('body');
    const footer = document.querySelector('.site-footer');
    
    // Pick a random quote to show
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    const quoteContainer = document.createElement('div');
    quoteContainer.className = 'quote-container';
    quoteContainer.innerHTML = `<p id="quote" class="quote-text">"${randomQuote}"<span class="quote-attribution">— Anaïs Nin</span></p>`;
    
    const content = document.querySelector('.content');
    if (content) {
        content.appendChild(quoteContainer);
    } else if (footer) {
        body.insertBefore(quoteContainer, footer);
    } else {
        body.appendChild(quoteContainer);
    }
}

// Last.fm API integration
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
        
        if (track) {
            const artist = track.artist['#text'];
            const song = track.name;
            const albumImage = track.image && track.image[2] ? track.image[2]['#text'] : '';
            const isPlaying = track['@attr'] && track['@attr'].nowplaying;
            
            // Only show if currently playing
            if (isPlaying) {
                document.getElementById('music-status').style.visibility = 'visible';
                
                const trackInfo = document.getElementById('track-info');
                if (albumImage) {
                    trackInfo.innerHTML = `<img src="${albumImage}" alt="Album cover for ${song} by ${artist}" loading="lazy" width="56" height="56"><span class="track-text">${artist} - ${song}</span>`;
                } else {
                    trackInfo.innerHTML = `<span class="track-text">${artist} - ${song}</span>`;
                }
            } else {
                document.getElementById('music-status').style.visibility = 'hidden';
            }
        } else {
            document.getElementById('music-status').style.visibility = 'hidden';
        }
    } catch {
        document.getElementById('music-status').style.visibility = 'hidden';
    }
}

// Weather API integration using weather.gov
async function getWeather() {
    try {
        // First get the grid coordinates for Ann Arbor, MI
        const pointResponse = await fetch(
            'https://api.weather.gov/points/42.2808,-83.7430'
        );
        
        if (!pointResponse.ok) {
            throw new Error('Failed to fetch weather grid data');
        }
        
        const pointData = await pointResponse.json();
        const forecastUrl = pointData.properties.forecast;
        
        // Get the current conditions
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch weather forecast');
        }
        
        const forecastData = await forecastResponse.json();
        const current = forecastData.properties.periods[0];
        
        const emoji = getWeatherEmoji(current.shortForecast);
        const weatherElement = document.querySelector('#weather-info');
        if (weatherElement) {
            weatherElement.innerHTML = `${emoji} ${current.temperature}°F, ${current.shortForecast}`;
        }
    } catch {
        const weatherElement = document.querySelector('#weather-info');
        if (weatherElement) {
            weatherElement.innerHTML = 'Weather unavailable';
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
        hour12: true
    };
    const timeString = now.toLocaleTimeString('en-US', options);
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${timeString} EST`;
    }
}

// Scale page to fit viewport
function fitToScreen() {
    document.body.style.zoom = '1';
    const contentHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    if (contentHeight > viewportHeight) {
        document.body.style.zoom = viewportHeight / contentHeight;
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initQuotes();
    getCurrentTrack();
    getWeather();
    updateTime();
    fitToScreen();
    window.addEventListener('resize', fitToScreen);

    // Refresh current track every 30 seconds
    setInterval(getCurrentTrack, 5000);
    // Refresh weather every 10 minutes
    setInterval(getWeather, 600000);
    // Update time every minute
    setInterval(updateTime, 60000);
});