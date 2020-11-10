import { Plugins } from "@capacitor/core";
import { isPlatform } from "@ionic/core";

const { App } = Plugins;

/**
 * AWS Amplify Analytics uses `window.onbeforeunload` event to trigger the end
 * of a users session.  By default, this event isn't fired in a
 * capacitor/cordova native application.  This helper patches this by listening
 * for the capacitor appStateChange event, and when the app is not active,
 * manually triggering the beforeunload event. This allows AWS Analytics to
 * correctly record session durations
 */
export function setupCapacitorAmplifyAnalytics(awsConfig: any) {
  if (isPlatform("capacitor") && !!awsConfig.aws_mobile_analytics_app_id) {
    // catch the app background event and dispatch a window.beforeunload event
    // so the session duration is properly calculated
    App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) {
        window.dispatchEvent(new Event("beforeunload"));
      }
    });
  }
}
