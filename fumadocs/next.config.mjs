import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/**
 * Redirects from the legacy Mintlify URL structure so existing external links
 * (SDK READMEs, support threads, search results) keep resolving after cutover.
 */
const legacyRedirects = [
  // Get started
  { source: '/quickstart', destination: '/docs/guides/quickstart' },
  { source: '/sdk/installation', destination: '/docs/guides/setup/platform-support' },
  // Guides
  { source: '/guides/content-types', destination: '/docs/guides/concepts/content-model' },
  { source: '/guides/upload-pipeline', destination: '/docs/guides/content/upload-videos' },
  { source: '/guides/live-streams', destination: '/docs/guides/content/live-streams' },
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

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
};

export default withMDX(config);
