import Amplify from "@aws-amplify/core";
import { Plugins } from "@capacitor/core";

const { App, Browser } = Plugins;

export class CapacitorAmplifyHostedLogin {
  private static signInUrl: string;
  private static singOutUrl: string;

  constructor() {}

  static initialize({ oauth }: any = {}) {
    // only initialize the appOpenUrl listeners if there is an appropriate callback
    // urls set in the awsconfig
    if (oauth && (oauth.redirectSignIn || oauth.redirectSignOut)) {
      this.signInUrl = oauth.redirectSignIn;
      this.singOutUrl = oauth.redirectSignOut;
      this.setupAppUrlListener();
    }
  }

  static async openUrl(url: string) {
    await Browser.open({ url });
  }

  private static setupAppUrlListener() {
    App.addListener("appUrlOpen", async ({ url }) => {
      if (url.includes(this.signInUrl) || url.includes(this.singOutUrl)) {
        // Don't await this promise as we aren't interested in it's response and
        // want the login to occur as quickly as possible
        Browser.close().catch(() => {
          // silently catch any errors
        });

        if (url.includes(this.signInUrl)) {
          await this.workAroundAmplifyReplaceHistoryBug(async () => {
            await Amplify.Auth._handleAuthResponse(url);
          });
        }
      }
    });
  }

  /**
   *
   * _.handleAuthResponse will throw an error in the app due to the amplify
   * library. this error only occurs as the library tries to replace the url
   * with an invalid url.  This doesn't break the sign-in see
   * https://github.com/aws-amplify/amplify-js/issues/3391 or
   * https://github.com/aws-amplify/amplify-js/issues/3188
   */

  private static async workAroundAmplifyReplaceHistoryBug(
    cb: () => Promise<void>
  ) {
    const originalFn = window.history.replaceState;
    window.history.replaceState = (data, title, url?) => {
      if (url !== this.signInUrl) {
        originalFn(data, title, url);
      }
    };
    try {
      await cb();
    } catch (error) {
      // allow the error to propagate
      throw error;
    } finally {
      window.history.replaceState = originalFn;
    }
  }
}
