import { bootstrapLynxApplication } from '@blotch/angular-lynx';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapLynxApplication(AppComponent, appConfig).catch((err) => {
  // Re-throw so Lynx's native error overlay displays the actual error
  setTimeout(() => {
    throw err;
  }, 0);
});
