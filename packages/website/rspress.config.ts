import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginSass } from '@rsbuild/plugin-sass';
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from '@shikijs/transformers';
import mermaid from 'rspress-plugin-mermaid';

const apiSidebar = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'api-sidebar.json'), 'utf-8'),
);

export default defineConfig({
  plugins: [mermaid()],
  root: 'docs',
  title: 'AngularLynx',
  description: 'Angular framework for building Lynx apps',
  icon: '/logo-light.svg',
  logo: {
    light: '/logo-light.svg',
    dark: '/logo-dark.svg',
  },
  logoText: 'AngularLynx',
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
        link: '/guide/quick-start',
      },
      {
        text: 'API',
        link: '/guide/api/angular-lynx/',
      },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Quick Start', link: '/guide/quick-start' },
        {
          dividerType: 'solid',
        },
        {
          sectionHeaderText: 'Learn AngularLynx',
        },
        { text: 'What is AngularLynx?', link: '/guide/introduction' },
        { text: 'Renderer Architecture', link: '/guide/renderer-architecture' },
        { text: 'Change Detection', link: '/guide/change-detection' },
        { text: 'Signals', link: '/guide/signals' },
        {
          text: 'Lynx Elements',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/elements/' },
            { text: '<view>', link: '/guide/elements/view' },
            { text: '<text>', link: '/guide/elements/text' },
            { text: '<image>', link: '/guide/elements/image' },
            { text: '<scroll-view>', link: '/guide/elements/scroll-view' },
            { text: '<list>', link: '/guide/elements/list' },
            { text: '<input>', link: '/guide/elements/input' },
            { text: '<textarea>', link: '/guide/elements/textarea' },
            { text: '<overlay>', link: '/guide/elements/overlay' },
            { text: '<frame>', link: '/guide/elements/frame' },
            { text: '<block>', link: '/guide/elements/block' },
            { text: '<svg>', link: '/guide/elements/svg' },
            { text: 'Event Handling', link: '/guide/elements/event-handling' },
          ],
        },
        { text: 'Routing', link: '/guide/routing' },
        { text: 'Remote Logging', link: '/guide/remote-logging' },
        {
          dividerType: 'solid',
        },
        {
          sectionHeaderText: 'Ecosystem',
        },
        { text: 'Tailwind CSS', link: '/guide/tailwindcss' },
        { text: 'AngularLynx Testing Library', link: '/guide/testing' },
        {
          dividerType: 'solid',
        },
        {
          sectionHeaderText: 'API Reference',
        },
        ...apiSidebar,
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
