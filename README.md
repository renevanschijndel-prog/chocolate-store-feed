# Chocolate Store Social Feed (Public Stub Demo)

A minimal, **public** demo of a social feed for a fictional chocolate store. All data comes from in-repo JSON fixtures; **no external APIs** are called at runtime.

## Features

- Browse a community feed (newest first)
- View post detail with comments
- Like/unlike posts (session-local)
- Create posts with optional product association and image URL
- View product detail from product chips
- Delete your own posts and comments (demo user)
- Stub "Report" action

Demo writes are stored in **sessionStorage** and labeled in the UI.

## Quick start

```bash
cd chocolate-store-feed
python3 -m http.server 8080 --directory public
```

Open [http://localhost:8080](http://localhost:8080).

## Project layout

- `public/index.html` — App shell
- `public/app.js` — UI logic (stub data + session state)
- `public/styles.css` — Styles
- `public/data/stub.json` — Seed users, products, posts, comments
- `docs/PRD.md` — Product requirements document

## Constraints (by design)

- No OAuth, payment, or third-party HTTP APIs
- No image upload service (optional image URL field only)
- No backend database; persistence is per-browser session only

## License

MIT — see [LICENSE](LICENSE).
