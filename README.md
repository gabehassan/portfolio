# gabehassan.com

My personal site. HTML, CSS, and JavaScript on Cloudflare Pages, with no build step.

- `index.html` is the homepage. Its CSS is inline, and a small script at the bottom picks the text size that keeps the whole page on one screen.
- `justmonitors.html`, `watchlist-match.html`, `photo-booth.html`, and `squarespace-checkout.html` are the project pages, served without the `.html`. They share `src/css/pages.css` and `src/js/pages.js`.
- Files in `assets/` are cached for a year, so a changed file needs a new name.
- Photos and the resume aren't in this repo. They live in a separate private folder and a Cloudflare Worker serves them at `/media/...` and `/resume.pdf`.
