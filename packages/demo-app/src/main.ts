import { bootstrapLynxApplication } from '@blotch/angular-lynx';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapLynxApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
