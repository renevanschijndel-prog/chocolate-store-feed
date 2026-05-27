# PRD: Chocolate Store Social Feed (Public Stub Demo)

**Status:** Draft  
**Date:** 2026-05-27  
**Reference app:** `chocolate-store-feed` (public, stub data only, no external APIs)

## Opportunity

Community content around purchases drives discovery and repeat visits for specialty retail. A lightweight in-app social feed lets shoppers share what they bought, see peer recommendations, and jump to product pages without leaving the store experience.

For this initiative we ship a **public, self-contained demo** first: no third-party APIs, no secrets, and fixture-backed data so anyone can run and review the UX locally.

## Customer pains

- Shoppers lack a place to see **peer reviews and photos** beyond isolated product pages.
- Product discovery depends on **catalog browse** rather than social proof.
- Demos that depend on live APIs are **fragile** and hard to share externally.

## Proposed solution

| Area | v1 decision |
|------|-------------|
| External APIs | **Not used** — seed data from `public/data/stub.json` |
| Writes | **Session-local** (sessionStorage) for posts, likes, comments |
| Auth | **Stub user** selector (no OAuth) |
| Images | Static URLs in fixtures or optional URL field |
| Distribution | **Public MIT** repo; local static server |

**In scope:** Feed, post detail, likes, comments, create post, product detail, delete own content, stub report.  
**Out of scope:** DMs, follows, hashtags, push notifications, real moderation, uploads, ranking algorithms.

## Acceptance criteria

- [ ] Feed loads from stub JSON without external network calls after first load
- [ ] New post appears at top of feed for current demo session
- [ ] Like count updates on toggle
- [ ] Comments appear on post detail
- [ ] Product chip opens product detail
- [ ] UI labels synthetic/demo data clearly

## Open questions

1. Feed visible when logged out vs demo user required?
2. Is session-only persistence sufficient for v1?
3. Is v2 with real API planned?
