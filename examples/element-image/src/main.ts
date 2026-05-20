import { bootstrapApplication } from '@blotch/angular-lynx';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  setTimeout(() => {
    throw err;
  }, 0);
});
