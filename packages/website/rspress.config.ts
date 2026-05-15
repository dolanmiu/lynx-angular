import path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginSass } from '@rsbuild/plugin-sass';
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from '@shikijs/transformers';
import mermaid from 'rspress-plugin-mermaid';

export default defineConfig({
  plugins: [mermaid()],
  root: 'docs',
  title: 'Angular Lynx',
  description: 'Angular framework for building Lynx apps',
  icon: '/logo-light.svg',
  logo: {
    light: '/logo-light.svg',
    dark: '/logo-dark.svg',
  },
  logoText: 'Angular Lynx',
  lang: 'en',
  markdown: {
    shiki: {
      transformers: [
        transformerNotationDiff(),
        transformerNotationFocus(),
        transformerNotationHighlight(),
      ],
    },
  },
  route: {
    cleanUrls: true,
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        content: 'https://github.com/lynx-family/angular-lynx',
        mode: 'link',
      },
    ],
    footer: {
      message: `© ${new Date().getFullYear()} Blotch Smart Frames. All Rights Reserved.`,
    },
    nav: [
      {
        text: 'Guide',
        link: '/guide/introduction',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          sectionHeaderText: 'Getting Started',
        },
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'Quick Start', link: '/guide/quick-start' },
        {
          dividerType: 'solid',
        },
        {
          sectionHeaderText: 'Core Concepts',
        },
        { text: 'Renderer Architecture', link: '/guide/renderer-architecture' },
        { text: 'Lynx Elements', link: '/guide/lynx-elements' },
        { text: 'Change Detection', link: '/guide/change-detection' },
        {
          dividerType: 'solid',
        },
        {
          sectionHeaderText: 'Features',
        },
        { text: 'Routing', link: '/guide/routing' },
        { text: 'Signals', link: '/guide/signals' },
        { text: 'Tailwind CSS', link: '/guide/tailwindcss' },
      ],
    },
  },
  builderConfig: {
    plugins: [pluginSass()],
    source: {
      alias: {
        '@comp': path.join(__dirname, 'src/components'),
      },
    },
    server: {
      open: 'http://localhost:<port>/',
    },
  },
});
