import type { Routes } from '@angular/router';
import { ElementsShowcaseComponent } from './elements-showcase/elements-showcase.component';
import { ListExampleComponent } from './list-example/list-example.component';
import { MotionDemoComponent } from './motion-demo/motion-demo.component';
import { OverlayMotionDemoComponent } from './overlay-motion-demo/overlay-motion-demo.component';
import { QuerySelectorDemoComponent } from './query-selector-demo/query-selector-demo.component';
import { ScrollExampleComponent } from './scroll-example/scroll-example.component';
import { TailwindDemoComponent } from './tailwind-demo/tailwind-demo.component';

export const routes: Routes = [
  // Default route for '/' — redirects to list-example to prevent
  // NavigationError which crashes Lynx's background thread.
  { path: '', pathMatch: 'full', redirectTo: 'list-example' },
  { path: 'list-example', component: ListExampleComponent },
  { path: 'scroll-example', component: ScrollExampleComponent },
  { path: 'showcase', component: ElementsShowcaseComponent },
  { path: 'query-selector-demo', component: QuerySelectorDemoComponent },
  { path: 'tailwind-demo', component: TailwindDemoComponent },
  { path: 'motion-demo', component: MotionDemoComponent },
  { path: 'overlay-motion-demo', component: OverlayMotionDemoComponent },
];
