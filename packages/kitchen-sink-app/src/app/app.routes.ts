import type { Routes } from '@angular/router';
import { ScrollExampleComponent } from './scroll-example/scroll-example.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list-example' },
  {
    path: 'list-example',
    loadComponent: () =>
      import('./list-example/list-example.component').then(
        (m) => m.ListExampleComponent,
      ),
  },
  { path: 'scroll-example', component: ScrollExampleComponent },
  {
    path: 'showcase',
    loadComponent: () =>
      import('./elements-showcase/elements-showcase.component').then(
        (m) => m.ElementsShowcaseComponent,
      ),
  },
  {
    path: 'query-selector-demo',
    loadComponent: () =>
      import('./query-selector-demo/query-selector-demo.component').then(
        (m) => m.QuerySelectorDemoComponent,
      ),
  },
  {
    path: 'tailwind-demo',
    loadComponent: () =>
      import('./tailwind-demo/tailwind-demo.component').then(
        (m) => m.TailwindDemoComponent,
      ),
  },
  {
    path: 'motion-demo',
    loadComponent: () =>
      import('./motion-demo/motion-demo.component').then(
        (m) => m.MotionDemoComponent,
      ),
  },
  {
    path: 'overlay-motion-demo',
    loadComponent: () =>
      import('./overlay-motion-demo/overlay-motion-demo.component').then(
        (m) => m.OverlayMotionDemoComponent,
      ),
  },
  {
    path: 'css-modules-demo',
    loadComponent: () =>
      import('./css-modules-demo/css-modules-demo.component').then(
        (m) => m.CssModulesDemoComponent,
      ),
  },
  {
    path: 'defer-demo',
    loadComponent: () =>
      import('./defer-demo/defer-demo.component').then(
        (m) => m.DeferDemoComponent,
      ),
  },
  {
    path: 'gesture-demo',
    loadComponent: () =>
      import('./gesture-demo/gesture-demo.component').then(
        (m) => m.GestureDemoComponent,
      ),
  },
  {
    path: 'fonts-demo',
    loadComponent: () =>
      import('./fonts-demo/fonts-demo.component').then(
        (m) => m.FontsDemoComponent,
      ),
  },
  {
    path: 'text-measure-demo',
    loadComponent: () =>
      import('./text-measure-demo/text-measure-demo.component').then(
        (m) => m.TextMeasureDemoComponent,
      ),
  },
  {
    path: 'content-projection-demo',
    loadComponent: () =>
      import('./content-projection-demo/content-projection-demo.component').then(
        (m) => m.ContentProjectionDemoComponent,
      ),
  },
  {
    path: 'exposure-demo',
    loadComponent: () =>
      import('./exposure-demo/exposure-demo.component').then(
        (m) => m.ExposureDemoComponent,
      ),
  },
  {
    path: 'main-thread-demo',
    loadComponent: () =>
      import('./main-thread-demo/main-thread-demo.component').then(
        (m) => m.MainThreadDemoComponent,
      ),
  },
  {
    path: 'session-storage-demo',
    loadComponent: () =>
      import('./session-storage-demo/session-storage-demo.component').then(
        (m) => m.SessionStorageDemoComponent,
      ),
  },
  {
    path: 'worklet-directive-demo',
    loadComponent: () =>
      import('./worklet-directive-demo/worklet-directive-demo.component').then(
        (m) => m.WorkletDirectiveDemoComponent,
      ),
  },
  {
    path: 'transition-demo',
    loadComponent: () =>
      import('./transition-demo/transition-demo.component').then(
        (m) => m.TransitionDemoComponent,
      ),
  },
  {
    path: 'i18n-demo',
    loadComponent: () =>
      import('./i18n-demo/i18n-demo.component').then(
        (m) => m.I18nDemoComponent,
      ),
  },
  {
    path: 'forms-demo',
    loadComponent: () =>
      import('./forms-demo/forms-demo.component').then(
        (m) => m.FormsDemoComponent,
      ),
  },
  {
    path: 'ssr-demo',
    loadComponent: () =>
      import('./ssr-demo/ssr-demo.component').then((m) => m.SsrDemoComponent),
  },
];
