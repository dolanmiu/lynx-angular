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
    globalComponents: [path.join(__dirname, 'src/components/go/go.tsx')],
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
        { text: 'Testing', link: '/guide/testing' },
        { text: 'Remote Logging', link: '/guide/remote-logging' },
      ],
    },
  },
  builderConfig: {
    plugins: [pluginSass()],
    html: {
      tags: [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/web-core/static/css/client.css',
          },
          head: true,
        },
        {
          tag: 'script',
          attrs: { src: '/web-core/static/js/client.js' },
          head: true,
        },
      ],
    },
    source: {
      alias: {
        '@comp': path.join(__dirname, 'src/components'),
        '@lynx-js/web-core/client': path.join(
          __dirname,
          'src/web-core-shim.ts',
        ),
        '@lynx-js/web-elements/all': path.join(
          __dirname,
          'src/web-core-shim.ts',
        ),
        '@lynx-js/web-elements': path.join(__dirname, 'src/web-core-shim.ts'),
      },
      include: [/[\\/]node_modules[\\/]@lynx-js[\\/]go-web[\\/]/],
    },
    server: {
      open: 'http://localhost:<port>/',
    },
  },
});
