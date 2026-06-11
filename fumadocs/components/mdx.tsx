import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import type { MDXComponents } from 'mdx/types';
import { OpenAPIPage } from '@/components/api-page';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    Accordion,
    Accordions,
    OpenAPIPage,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
