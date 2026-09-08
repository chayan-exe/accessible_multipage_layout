# AccessBoard Capstone Dashboard

A responsive, accessible multi-page dashboard capstone with simulated authentication, public REST API catalog, dynamic CRUD, client-side persistence, responsive glassmorphism UI, and robust loading/error states.

## Architecture

```text
Browser
  |
  +--> login.html
  |      +--> simulated authentication
  |      +--> localStorage: accessboard_auth_v1
  |
  +--> index.html
  |      +--> REST API: Fake Store API
  |      +--> search / category / sort
  |      +--> catalog CRUD
  |      +--> localStorage cache
  |
  +--> users.html
  |      +--> user CRUD
  |      +--> localStorage persistence
  |
  +--> reports.html
  +--> settings.html
         +--> preferences persisted locally

Shared: css/style.css + js/main.js
```

## Features

- Semantic HTML5 multi-page dashboard.
- Simulated authentication with protected dashboard pages.
- Demo credentials: `admin` / `admin123`.
- Async/await `fetch()` against Fake Store API.
- Search, category filtering, and sorting without reloads.
- Add, edit, and delete catalog products.
- Add, edit, and delete users.
- localStorage for authentication, API cache, users, products, theme, and settings.
- Loading skeletons and retryable API error banner.
- Dark/light theme with persistent preference.
- Responsive breakpoints for mobile, tablet, desktop, and wide screens.
- Glassmorphism, soft shadows, hover transitions, and focus-visible states.
- Mobile horizontal overflow protection.
- Accessible labels, fieldsets, validation, live regions, dialog modals, captions, and table scopes.

## Run locally

No build step is required.

1. Extract the folder.
2. Open it with VS Code Live Server, or serve it with any static HTTP server.
3. Start at `login.html`.
4. Sign in with `admin` / `admin123`.

Using a local HTTP server is recommended because browser security policies can affect `fetch()` requests when HTML is opened directly from `file://`.

## API

The catalog uses Fake Store API: `https://fakestoreapi.com/products`.

If the network request fails, the application displays an accessible error banner and a Retry button. Successful API responses are cached locally for 10 minutes.

## Deployment

This is a static application and can be deployed to Vercel, Netlify, or Cloudflare Pages by importing the project/repository. No build command is required; the project root is the publish directory.

A real public deployment URL requires access to the chosen hosting account, so this package contains the deployment-ready application but does not claim a live URL has been published.

## Validation

Validate every HTML page with the W3C Markup Validation Service before submission:

https://validator.w3.org/

Recommended pages:
- `login.html`
- `index.html`
- `users.html`
- `reports.html`
- `settings.html`

## Project structure

```text
accessible-multipage-layout/
├── index.html
├── login.html
├── users.html
├── reports.html
├── settings.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── main.js
```
