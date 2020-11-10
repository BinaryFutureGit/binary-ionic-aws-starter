import { ModuleWithProviders, NgModule } from "@angular/core";
import "@aws-amplify/auth";
import Amplify from "@aws-amplify/core";
import { Platform } from "@ionic/angular";
import { AmplifyService } from "aws-amplify-angular";
import { AmplifyAuthState } from "./amplify-auth-state/amplify-auth-state.service";
import { CordovaAmplifyStorage } from "./cordova-amplify-storage/cordova-amplify-storage.service";

@NgModule({
  imports: [],
  exports: [],
  providers: [],
})
export class CordovaAmplifyModule {
  static forRoot(
    awsConfig: any,
    amplifyModules: any = null
  ): ModuleWithProviders {
    return {
      ngModule: CordovaAmplifyModule,
      providers: [
        AmplifyAuthState,
        {
          provide: AmplifyService,
          useFactory: (
            platform: Platform,
            cordovaStorage: CordovaAmplifyStorage
            // capHostedUiLogin: CapacitorAmplifyHostedLogin
          ) => {
            if (platform.is("cordova")) {
              Object.assign(awsConfig, {
                auth: {
                  ...awsConfig.auth,
                  storage: cordovaStorage,
                  // openUrl: capHostedUiLogin.openUrl.bind(capHostedUiLogin),
                },
              });
            }
            Amplify.configure(awsConfig);
            return new AmplifyService(amplifyModules);
          },
          deps: [
            Platform,
            CordovaAmplifyStorage,
            // CapacitorAmplifyHostedLogin,
          ],
        },
      ],
    };
  }
}
