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
];
