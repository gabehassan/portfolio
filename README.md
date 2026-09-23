# gabehassan.com

My personal site. HTML, CSS, and JavaScript on Cloudflare Pages, with no build step.

- `index.html` is the homepage. Its CSS is inline, and a small script at the bottom picks the text size that keeps the whole page on one screen.
- The project pages are in `pages/`. `_redirects` serves them at short URLs like `/justmonitors`. They share `src/css/pages.css` and `src/js/pages.js`.
- `npm run dev` runs the site locally with Cloudflare's own dev server, so `_redirects` and `_headers` work the same as in production.
- Files in `assets/` are cached for a year, so a changed file needs a new name.
- Photos and the resume aren't in this repo. They live in a separate private folder and a Cloudflare Worker serves them at `/media/...` and `/resume.pdf`.
