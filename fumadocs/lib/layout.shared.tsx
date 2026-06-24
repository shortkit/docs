import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // Animated wordmark (typewriter reveal + blinking cursor live inside the SVG).
      // Two variants swapped by theme; `unoptimized`-style raw <img> so the SVG's
      // internal CSS animation runs.
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/light.svg"
            alt="shortkit"
            className="block h-6 w-auto dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/dark.svg"
            alt="shortkit"
            className="hidden h-6 w-auto dark:block"
          />
        </>
      ),
    },
    links: [
      {
        text: 'Home',
        url: 'https://shortkit.dev',
        external: true,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
