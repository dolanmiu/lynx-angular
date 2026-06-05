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
  icon: '/logo.png',
  logo: {
    light: '/logo.png',
    dark: '/logo.png',
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
      {
        text: 'Examples',
        link: '/guide/examples/',
      },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Quick Start', link: '/guide/quick-start' },
        { text: 'Schematics', link: '/guide/schematics' },
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
          text: 'Host Data',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/host-data/' },
            { text: 'InitData', link: '/guide/host-data/init-data' },
            { text: 'GlobalData', link: '/guide/host-data/global-data' },
            {
              text: 'Data Processors',
              link: '/guide/host-data/data-processors',
            },
          ],
        },
        { text: 'Session Storage', link: '/guide/session-storage' },
        { text: 'Error Handling', link: '/guide/error-handling' },
        { text: 'Portal (Programmatic Overlays)', link: '/guide/portal' },
        { text: 'Accessibility', link: '/guide/accessibility' },
        {
          text: 'Lynx Elements',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/elements/' },
            { text: '<view>', link: '/guide/elements/view' },
            { text: '<text>', link: '/guide/elements/text' },
            { text: '<image>', link: '/guide/elements/image' },
            { text: '<scroll-view>', link: '/guide/elements/scroll-view' },
            { text: '<refresh>', link: '/guide/elements/refresh' },
            {
              text: '<scroll-coordinator>',
              link: '/guide/elements/scroll-coordinator',
            },
            { text: '<list>', link: '/guide/elements/list' },
            { text: '<input>', link: '/guide/elements/input' },
            { text: '<textarea>', link: '/guide/elements/textarea' },
            { text: '<overlay>', link: '/guide/elements/overlay' },
            { text: '<viewpager>', link: '/guide/elements/viewpager' },
            { text: '<frame>', link: '/guide/elements/frame' },
            { text: '<block>', link: '/guide/elements/block' },
            { text: '<svg>', link: '/guide/elements/svg' },
            { text: 'Event Handling', link: '/guide/elements/event-handling' },
          ],
        },
        { text: 'Exposure Detection', link: '/guide/exposure' },
        {
          text: 'Gestures',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/gestures/' },
            { text: 'Gesture Types', link: '/guide/gestures/gesture-types' },
            { text: 'Lifecycle', link: '/guide/gestures/lifecycle' },
            { text: 'Composition', link: '/guide/gestures/composition' },
            {
              text: 'Complete Example',
              link: '/guide/gestures/complete-example',
            },
          ],
        },
        {
          text: 'Animations',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/animations/' },
            {
              text: 'CSS Transitions',
              link: '/guide/animations/css-transitions',
            },
            { text: 'CSS @keyframes', link: '/guide/animations/css-keyframes' },
            {
              text: 'Programmatic API',
              link: '/guide/animations/programmatic',
            },
            {
              text: 'Enter/Leave Transitions',
              link: '/guide/animations/enter-leave',
            },
          ],
        },
        { text: '@defer', link: '/guide/defer' },
        { text: 'CSS Modules', link: '/guide/css-modules' },
        {
          text: 'Custom Fonts',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/custom-fonts/' },
            {
              text: 'Dynamic Font Loading',
              link: '/guide/custom-fonts/dynamic-font-loading',
            },
          ],
        },
        { text: 'Text Measurement', link: '/guide/text-measurement' },
        { text: 'Safe Area', link: '/guide/safe-area' },
        { text: 'Dark Mode', link: '/guide/dark-mode' },
        { text: 'Internationalization', link: '/guide/i18n' },
        { text: 'Routing', link: '/guide/routing' },
        { text: 'Forms', link: '/guide/forms' },
        { text: 'Remote Logging', link: '/guide/remote-logging' },
        { text: 'DevTools', link: '/guide/devtools' },
        {
          text: 'Building for Production',
          link: '/guide/building-for-production',
        },
        {
          dividerType: 'solid',
        },
        {
          sectionHeaderText: 'Advanced',
        },
        { text: 'SelectorQuery', link: '/guide/selector-query' },
        {
          text: 'Main Thread Scripts',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/main-thread/' },
            { text: 'mainThreadFn', link: '/guide/main-thread/main-thread-fn' },
            {
              text: 'LynxMainThreadEvent',
              link: '/guide/main-thread/main-thread-event',
            },
            {
              text: 'MainThreadRef',
              link: '/guide/main-thread/main-thread-ref',
            },
            {
              text: 'LynxMainThreadService',
              link: '/guide/main-thread/main-thread-service',
            },
            { text: 'backgroundFn', link: '/guide/main-thread/background-fn' },
            {
              text: 'Worklet Transform',
              link: '/guide/main-thread/worklet-transform',
            },
          ],
        },
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
          sectionHeaderText: 'Examples',
        },
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/examples/' },
            { text: 'Counter', link: '/guide/examples/counter' },
            { text: 'Todo List', link: '/guide/examples/todo-list' },
            { text: 'Form Input', link: '/guide/examples/form-input' },
            {
              text: 'Infinite Scroll',
              link: '/guide/examples/infinite-scroll',
            },
            {
              text: 'Pull to Refresh',
              link: '/guide/examples/pull-to-refresh',
            },
            {
              text: 'Gesture Playground',
              link: '/guide/examples/gesture-playground',
            },
            { text: 'Modal Dialog', link: '/guide/examples/modal-dialog' },
            {
              text: 'Animated Cards',
              link: '/guide/examples/animated-cards',
            },
            {
              text: 'Enter/Leave Transitions',
              link: '/guide/examples/enter-leave',
            },
            { text: 'Dark Mode', link: '/guide/examples/dark-mode' },
            {
              text: 'Data Dashboard',
              link: '/guide/examples/data-dashboard',
            },
            {
              text: 'Tab Navigation',
              link: '/guide/examples/tab-navigation',
            },
          ],
        },
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
