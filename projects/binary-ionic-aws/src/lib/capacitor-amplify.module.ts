import { NgModule } from "@angular/core";
import Amplify from "@aws-amplify/core";
import { isPlatform } from "@ionic/core";
import { AmplifyService } from "aws-amplify-angular";
import { AmplifyFileDirective } from "./amplify-file/amplify-file.directive";
import { setupCapacitorAmplifyAnalytics } from "./capacitor-amplify-analytics-helper/capacitor-amplify-analytics-helper";
import { patchAmplifyClientDevice } from "./capacitor-amplify-client-device/capacitor-amplify-client-device";
import { CapacitorAmplifyHostedLogin } from "./capacitor-amplify-hosted-login/capacitor-amplify-hosted-login.service";
import { CapacitorAmplifyStorage } from "./capacitor-amplify-storage/capacitor-amplify-storage.service";

export interface CapacitorAmplifyModuleParams {
  /**
   * Pass the `awsconfig` that was generated by the Amplify CLI in as awsConfig.
   * This is used to configure Amplify to work with your AWS stack
   */
  awsConfig: any;
  /**
   * You can pass an alternative `awsconfig` here that will be used when running
   * in a capacitor native app. This is useful for changing oatuh redirection
   * urls to support custom app urls needed for Cognito Federated ID Login
   */
  capacitorAwsConfig?: any;
  amplifyModules?: any;
}

@NgModule({
  declarations: [AmplifyFileDirective],
  exports: [AmplifyFileDirective],
  imports: [],
  providers: [AmplifyService],
})
export class CapacitorAmplifyModule {
  static async configure({
    awsConfig,
    capacitorAwsConfig,
  }: CapacitorAmplifyModuleParams): Promise<void> {
    // first setup the ClientDevice patch and hydrate storage.
    let config = awsConfig;
    if (isPlatform("capacitor")) {
      const storage = new CapacitorAmplifyStorage();
      await Promise.all([patchAmplifyClientDevice(), storage.sync()]);
      config = capacitorAwsConfig || awsConfig;
      Object.assign(config, {
        oauth: {
          ...awsConfig.oauth,
          ...(capacitorAwsConfig && capacitorAwsConfig.oauth),
          urlOpener: CapacitorAmplifyHostedLogin.openUrl.bind(
            CapacitorAmplifyHostedLogin
          ),
        },
        storage,
      });
      CapacitorAmplifyHostedLogin.initialize(config);
      setupCapacitorAmplifyAnalytics(config);
    }
    Amplify.configure(config);
  }
}
