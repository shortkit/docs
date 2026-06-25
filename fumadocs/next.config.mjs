import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/**
 * Redirects from the legacy Mintlify URL structure so existing external links
 * (SDK READMEs, support threads, search results) keep resolving after cutover.
 */
const legacyRedirects = [
  // Get started
  { source: '/quickstart', destination: '/docs/guides/quickstart' },
  { source: '/sdk/installation', destination: '/docs/guides/quickstart' },
  // Guides
  { source: '/guides/content-types', destination: '/docs/guides/concepts/content-model' },
  { source: '/guides/upload-pipeline', destination: '/docs/api/guides/upload-videos' },
  { source: '/guides/live-streams', destination: '/docs/api/guides/live-streams' },
  { source: '/guides/language-detection', destination: '/docs/guides/content/language' },
  // SDK pages
  { source: '/sdk/feed', destination: '/docs/guides/display/feed' },
  { source: '/sdk/player-and-widget', destination: '/docs/guides/display/player' },
  { source: '/sdk/configuration', destination: '/docs/guides/reference/feed-config' },
  { source: '/sdk/player', destination: '/docs/guides/reference/player' },
  { source: '/sdk/overlays', destination: '/docs/guides/customize/overlays' },
  { source: '/sdk/carousel', destination: '/docs/guides/customize/carousel-control' },
  { source: '/sdk/identity', destination: '/docs/guides/concepts/identity' },
  { source: '/sdk/analytics', destination: '/docs/guides/analytics/overview' },
  { source: '/coming-soon', destination: '/docs/changelog' },
  // API reference overview pages (endpoint pages keep group paths; map the groups)
  { source: '/api/overview', destination: '/docs/api' },
  { source: '/api/authentication', destination: '/docs/api/authentication' },
  { source: '/api/errors', destination: '/docs/api/errors' },
  { source: '/api/:group/:page', destination: '/docs/api/:group' },
];

/**
 * Internal moves within the Fumadocs IA (keep deep links stable as the structure
 * evolves). API-interaction guides moved from the Docs tab to the API Reference tab.
 */
const internalRedirects = [
  { source: '/docs/guides/content/upload-videos', destination: '/docs/api/guides/upload-videos' },
  { source: '/docs/guides/content/carousels', destination: '/docs/api/guides/carousels' },
  { source: '/docs/guides/content/captions-and-metadata', destination: '/docs/api/guides/captions-and-metadata' },
  { source: '/docs/guides/content/live-streams', destination: '/docs/api/guides/live-streams' },
  { source: '/docs/guides/content/webhooks', destination: '/docs/api/guides/webhooks' },
  { source: '/docs/api/webhooks', destination: '/docs/api/guides/webhooks' },
  // Overview page retired — Docs tab lands on Quickstart.
  { source: '/docs/guides', destination: '/docs/guides/quickstart' },
  // The platform-agnostic install/platform-support page was removed; Installation
  // is now a collapsible folder of per-platform pages. Point its old URLs at Quickstart.
  { source: '/docs/guides/setup', destination: '/docs/guides/quickstart' },
  { source: '/docs/guides/setup/installation', destination: '/docs/guides/quickstart' },
  { source: '/docs/guides/setup/platform-support', destination: '/docs/guides/quickstart' },
  // Ads removed entirely (concept page + ad-config API section).
  { source: '/docs/guides/monetization/ads', destination: '/docs/guides/customize/item-overlays' },
  { source: '/docs/api/ad-configuration/:page*', destination: '/docs/api' },
  // Analytics overview + event forwarding now live under the Analytics API section.
  { source: '/docs/guides/analytics/overview', destination: '/docs/api/analytics/analytics-overview' },
  { source: '/docs/guides/analytics/event-forwarding', destination: '/docs/api/analytics/event-forwarding' },
  { source: '/docs/api/guides/analytics-overview', destination: '/docs/api/analytics/analytics-overview' },
  { source: '/docs/api/guides/event-forwarding', destination: '/docs/api/analytics/event-forwarding' },
  // Authentication + Errors folded into the API overview.
  { source: '/docs/api/authentication', destination: '/docs/api#authentication' },
  { source: '/docs/api/errors', destination: '/docs/api#errors' },
];

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [...legacyRedirects, ...internalRedirects].map((r) => ({ ...r, permanent: true }));
  },
};

export default withMDX(config);
