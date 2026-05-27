# Paste into Notion (official PRD format)

Copy sections below into: https://www.notion.so/36dda74ef045804ab2c7f2905b8fdea6

---

**Callout:** Official PRD layout aligned to 📋 PRD. Reference app: **chocolate-store-feed** (public repo; stub data only, no external APIs).

# 📋 Product Review: Chocolate Store Social Feed (Public Stub Demo)

- **Author:** Rene van Schijndel
- **Team:** Demo / GTM onboarding
- **Date:** 2026-05-27
- **Status:** Draft

## Opportunity

Community content around purchases drives discovery and repeat visits for specialty retail. A lightweight in-app social feed lets shoppers share what they bought, see peer recommendations, and jump to product pages without leaving the store experience.

For this initiative we ship a **public, self-contained demo** first: no third-party APIs, no secrets, and fixture-backed data so anyone can run and review the UX locally.

## Customer Pains

- Shoppers lack a place to see **peer reviews and photos** beyond isolated product pages.
- Product discovery depends on **catalog browse** rather than social proof.
- Demos that depend on live APIs are **fragile** and hard to share externally.

## Proposed Solution(s)

Static web demo “ChocoSocial” with in-repo stub JSON and session-local writes. No runtime external HTTP APIs.

| Area | v1 decision |
|------|-------------|
| External APIs | Not used |
| Data | `public/data/stub.json` + sessionStorage |
| Auth | Demo user selector |
| Distribution | Public MIT repo |

**In scope:** Feed, post detail, likes, comments, create post, product detail, delete own content, stub report.

## Mocks / Visuals / Prototype ⚠️ Required

- Working UI: `public/index.html` + `public/data/stub.json`
- Run: `python3 -m http.server 8080 --directory public`

## Key Questions for Leadership

1. Feed visible when logged out vs demo user required?
2. Is session-only persistence sufficient for v1?
3. Is v2 with real API planned?
