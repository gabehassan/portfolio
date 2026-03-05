# Gabriel Hassan Portfolio

A minimalist portfolio website with warm oatmeal aesthetic, featuring real-time music integration and weather data.

## Features

- **Responsive Design**: Works on all devices
- **Last.fm Integration**: Shows currently playing music with album covers
- **Weather Data**: Real-time weather for Ann Arbor, MI
- **UMich Easter Egg**: Confetti animation on hover
- **SEO Optimized**: For gabehassan.com

## Environment Variables

For security, set these in your Cloudflare Pages environment variables:

```
LASTFM_API_KEY=your_lastfm_api_key_here
LASTFM_USERNAME=your_lastfm_username
```

### Setting up in Cloudflare Pages:

1. Go to your Pages project dashboard
2. Navigate to Settings → Environment variables
3. Add the variables for Production environment
4. Redeploy the site

## Local Development

1. Clone the repository
2. Update the API key in `index.html` (lines 88-89)
3. Open `index.html` in a browser

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- Last.fm API for music data
- Weather.gov API for weather data
- Google Fonts (Instrument Serif, Merriweather, JetBrains Mono)

## APIs Used

- **Last.fm API**: Requires free API key from https://www.last.fm/api
- **Weather.gov**: Free, no API key required
- **Time**: Browser's built-in Date API with Detroit timezone