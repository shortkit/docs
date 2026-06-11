import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span
            aria-hidden
            className="inline-flex size-5 items-center justify-center rounded-md bg-fd-primary font-extrabold text-[13px] text-white"
          >
            S
          </span>
          <span className="font-semibold">{appName}</span>
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
