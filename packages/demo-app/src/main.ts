import { bootstrapLynxApplication } from '@blotch/ng-lynx';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapLynxApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
