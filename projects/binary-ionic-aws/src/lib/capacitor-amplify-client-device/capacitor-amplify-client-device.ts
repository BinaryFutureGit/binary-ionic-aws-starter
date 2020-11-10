import { ClientDevice } from "@aws-amplify/core";
import { DeviceInfo, Plugins } from "@capacitor/core";
import { isPlatform } from "@ionic/core";

const { Device } = Plugins;

let deviceInfo: DeviceInfo;

export async function patchAmplifyClientDevice() {
  if (isPlatform("capacitor")) {
    deviceInfo = await Device.getInfo();
    ClientDevice.clientInfo = clientInfo;
  }
}

export function clientInfo() {
  const timezone = browserTimezone();
  const { language } = window.navigator;

  return {
    platform: deviceInfo.platform,
    make: deviceInfo.manufacturer,
    model: deviceInfo.model,
    version: deviceInfo.osVersion,
    appVersion: [deviceInfo.appVersion, deviceInfo.appBuild].join("/"),
    language,
    timezone,
  };
}

function browserTimezone() {
  const tzMatch = /\(([A-Za-z\s].*)\)/.exec(new Date().toString());
  return tzMatch ? tzMatch[1] || "" : "";
}
