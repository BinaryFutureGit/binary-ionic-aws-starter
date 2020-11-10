import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
/**
 * As Amplify uses modular imports, it is necessary to manually define which
 * Amplify modules this app uses. For this example, we use @amplify/auth and
 * @amplify/storage. So that these modules are registered and available make
 * sure to import them.
 */
import "@aws-amplify/analytics";
import "@aws-amplify/auth";
import "@aws-amplify/storage";
import { CapacitorAmplifyModule } from "projects/binary-ionic-aws/src/projects";
/**
 * End Amplify imports
 */
import { AppModule } from "./app/app.module";
import awsConfig from "./aws-exports";
import capacitorAwsConfig from "./aws-exports.capacitor";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

/**
 * This controls Amplify log level. See https://aws-amplify.github.io/docs/js/logger#setting-logging-levels
 */
(window as any).LOG_LEVEL = "DEBUG";

CapacitorAmplifyModule.configure({ awsConfig, capacitorAwsConfig })
  .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
  .catch(err => console.log(err));
