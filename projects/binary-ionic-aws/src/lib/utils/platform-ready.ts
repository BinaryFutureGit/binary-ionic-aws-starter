import { isPlatform } from "@ionic/core";

export const platformReady = new Promise(resolve => {
  if (isPlatform("cordova")) {
    document.addEventListener("deviceready", () => resolve(), { once: true });
  } else {
    resolve();
  }
});
