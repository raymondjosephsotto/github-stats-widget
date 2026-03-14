# github-stats-widget
A React widget for displaying GitHub profile metadata, repository totals, contribution activity, and top languages using your own API endpoint.

This project is designed to pair with [`github-stats-api`](https://github.com/raymondjosephsotto/github-stats-api), which collects and normalizes GitHub data for the widget to render.

Published package:

```bash
npm install @raymondjosephsotto/github-stats-widget
```

## What It Shows

- Profile avatar, display name, and username
- Total repositories
- Total commits
- Total pull requests
- Total stars earned
- A GitHub-style contribution heatmap for the 2026 calendar year
- Top languages based on repository language usage

## API Shape

The widget expects an endpoint that returns data in this general shape:

```json
{
  "profile": {
    "avatarUrl": "https://avatars.githubusercontent.com/u/123456?v=4",
    "displayName": "Your Name",
    "username": "yourusername"
  },
  "repositories": {
    "contributedTo": 0,
    "total": 42
  },
  "totalCommits": 592,
  "totalPullRequests": 140,
  "totalStars": 2,
  "topLanguages": [
    {
      "name": "TypeScript",
      "color": "#3178c6",
      "percentage": 55.3
    }
  ],
  "contributions": {
    "total": 212,
    "from": "2026-01-01T00:00:00.000Z",
    "to": "2026-03-14T15:22:22.837Z",
    "weeks": [
      {
        "days": [
          {
            "date": "2026-03-01",
            "count": 5,
            "level": 1
          }
        ]
      }
    ]
  }
}
```

The widget also includes fallback normalization for a few legacy field names, but the `profile`, `repositories`, `topLanguages`, and `contributions` structure above is the recommended contract.

## Companion API

Use this widget with:

- [`github-stats-api`](https://github.com/raymondjosephsotto/github-stats-api)

That API is responsible for:

- authenticating with GitHub
- gathering profile metadata
- aggregating repository counts
- calculating total commits, pull requests, and stars
- building the contribution heatmap payload
- aggregating top languages

The widget itself is intentionally presentation-focused. It does not call GitHub directly.

## Installation

Install the package in your React app:

```bash
npm install @raymondjosephsotto/github-stats-widget
```

## Usage

Import the widget and pass your deployed API endpoint:

```tsx
import { GitHubStatsWidget } from "@raymondjosephsotto/github-stats-widget";

export default function Home() {
  return (
    <GitHubStatsWidget apiUrl="https://your-api.vercel.app/api/github" />
  );
}
```

You can also pass an optional `username` prop. The widget will prefer the username from the API response when available.

```tsx
<GitHubStatsWidget
  apiUrl="https://your-api.vercel.app/api/github"
  username="yourusername"
/>
```

## Clone Or Fork Setup

If you clone or fork this repository, the usual workflow is:

1. Install dependencies
2. Run the local preview app
3. Build the package
4. Publish your own npm package name if you want to consume it from another repository or CI environment

Initial setup:

```bash
npm install
npm run dev
```

If you are creating your own fork for publishing, update [`package.json`](/Users/raymond/Desktop/github-stats-widget/package.json) with your own package name before publishing. A scoped name is recommended:

```json
{
  "name": "@your-npm-username/github-stats-widget"
}
```

This is especially important if another project installs the widget through GitHub Actions, Vercel, or any remote CI environment, because local file references such as `file:../github-stats-widget` will not exist there.

## Local Development

Install dependencies:

```bash
npm install
```

Start the local preview app:

```bash
npm run dev
```

Then open the local Vite URL and point the preview form at your API endpoint.

You can also set a default API URL through an environment variable:

```bash
VITE_GITHUB_STATS_API_URL=https://your-api.vercel.app/api/github npm run dev
```

## Publishing

To publish the package to npm:

```bash
npm login
npm run build
npm publish --access public
```

If your npm account requires two-factor authentication for publishing, you may need:

```bash
npm publish --access public --otp=123456
```

If you fork this repository, publish under your own scoped package name and then update your consuming app to install that package from npm instead of using a local `file:` reference.

## Automated Versioning And Publishing

This repository can be configured to automate versioning and publishing with GitHub Actions.

Included workflows:

- [ci.yml](/Users/raymond/Desktop/github-stats-widget/.github/workflows/ci.yml): runs `npm ci` and `npm run build` on every push to `main` and every pull request
- [release-please.yml](/Users/raymond/Desktop/github-stats-widget/.github/workflows/release-please.yml): watches `main`, opens or updates a release PR, and manages version bumps
- [publish.yml](/Users/raymond/Desktop/github-stats-widget/.github/workflows/publish.yml): publishes to npm when a GitHub Release is published from `main`

Supporting config:

- [release-please-config.json](/Users/raymond/Desktop/github-stats-widget/release-please-config.json)
- [.release-please-manifest.json](/Users/raymond/Desktop/github-stats-widget/.release-please-manifest.json)

### How It Works

1. Push changes to `main`
2. Release Please opens or updates a release PR with the next version
3. When that PR is merged, Release Please creates a GitHub Release
4. The publish workflow builds the package and publishes it to npm

### Required Repository Secret

Add this GitHub Actions secret in your repository settings:

- `NPM_TOKEN`: an npm token with permission to publish this package

### Commit Message Guidance

Release Please works best when commit messages follow conventional commit style, for example:

```bash
feat: add top languages section
fix: correct heatmap weekday alignment
docs: update README publishing instructions
```

Typical version behavior:

- `fix:` -> patch release
- `feat:` -> minor release
- `feat!:` or a breaking change footer -> major release

If you fork this project, remember to update:

- [`package.json`](/Users/raymond/Desktop/github-stats-widget/package.json) package name
- [release-please-config.json](/Users/raymond/Desktop/github-stats-widget/release-please-config.json) package name
- npm secret configuration in your forked repository

## Build

Create the distributable package:

```bash
npm run build
```

If you want to rebuild continuously while developing the package output:

```bash
npm run build:watch
```

## Styling

The widget ships with scoped CSS classes prefixed with `gsw-` and uses CSS variables for core colors. You can override those variables from a consuming app if you want to adapt the look:

```css
.my-widget-wrapper .gsw-root {
  --gsw-bg: #0b1220;
  --gsw-bg2: #111827;
  --gsw-border: #243041;
  --gsw-text: #f8fafc;
  --gsw-text-muted: #94a3b8;
}
```

## Project Structure

- [`src/GitHubStatsWidget.tsx`](/Users/raymond/Desktop/github-stats-widget/src/GitHubStatsWidget.tsx): main widget component
- [`src/useGitHubStats.ts`](/Users/raymond/Desktop/github-stats-widget/src/useGitHubStats.ts): fetch + response normalization
- [`src/types.ts`](/Users/raymond/Desktop/github-stats-widget/src/types.ts): TypeScript response types
- [`src/GitHubStatsWidget.css`](/Users/raymond/Desktop/github-stats-widget/src/GitHubStatsWidget.css): widget styles
- [`demo/DemoApp.tsx`](/Users/raymond/Desktop/github-stats-widget/demo/DemoApp.tsx): local preview app

## Notes For Other Developers

- This package is a UI layer, not a GitHub data collector.
- The API should handle secrets, GitHub auth, pagination, aggregation, and caching.
- The widget expects contribution data as `weeks -> days`, similar to GitHub’s contribution calendar.
- The heatmap layout is responsive and computes cell sizing based on available width.
- If you change the API contract, update both [`src/types.ts`](/Users/raymond/Desktop/github-stats-widget/src/types.ts) and the normalization logic in [`src/useGitHubStats.ts`](/Users/raymond/Desktop/github-stats-widget/src/useGitHubStats.ts).
- If another repository consumes this widget, prefer installing the published npm package instead of using a local `file:` dependency so CI and deployments can resolve it correctly.

## Related Repositories

- Widget repo: [`github-stats-widget`](https://github.com/raymondjosephsotto/github-stats-widget)
- API: [`github-stats-api`](https://github.com/raymondjosephsotto/github-stats-api)
