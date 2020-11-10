import { AnalyticsClass } from "@aws-amplify/analytics";
import Amplify, { ConsoleLogger as Logger } from "@aws-amplify/core";
import { bindCapacitorListener } from "@binary-dev/ionic-helpers";
import {
  PermissionType,
  Plugins,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationToken,
} from "@capacitor/core";
import { isPlatform } from "@ionic/core";
import { defer, merge } from "rxjs";
import { mapTo, shareReplay, switchMap, take } from "rxjs/operators";

const { App, PushNotifications, Storage, Permissions } = Plugins;

const logger = new Logger("Notification");

const REMOTE_NOTIFICATION_RECEIVED = "remoteNotificationReceived";
const REMOTE_TOKEN_RECEIVED = "remoteTokenReceived";
const REMOTE_NOTIFICATION_OPENED = "remoteNotificationOpened";

export default class CapacitorAmplifyPushNotifications {
  private _config: {
    appId?: string;
    requestIOSPermissions?: boolean;
  };
  private appState: "foreground" | "background" = "foreground";

  capPushNotifications = PushNotifications;
  private registration$ = bindCapacitorListener<PushNotificationToken>(
    this.capPushNotifications,
    "registration"
  ).pipe(shareReplay(1));
  private registrationError$ = bindCapacitorListener(
    this.capPushNotifications,
    "registrationError"
  );
  private notificationReceived$ = bindCapacitorListener<PushNotification>(
    this.capPushNotifications,
    "pushNotificationReceived"
  );
  private notificationActionPerformed$ = bindCapacitorListener<
    PushNotificationActionPerformed
  >(this.capPushNotifications, "pushNotificationActionPerformed");

  private analytics: AnalyticsClass = Amplify.Analytics;

  notificationPermission$ = merge(
    defer(() =>
      Permissions.query({ name: PermissionType.Notifications }).then(
        ({ state }) => state
      )
    ),
    this.registration$.pipe(mapTo("granted")),
    bindCapacitorListener(App, "appStateChange").pipe(
      switchMap(() =>
        Permissions.query({ name: PermissionType.Notifications }).then(
          ({ state }) => state
        )
      )
    )
  );

  constructor(config: any) {
    this.configure(config);
  }

  getModuleName() {
    return "Pushnotification";
  }

  configure(config) {
    let conf = config ? config.PushNotification || config : {};

    if (conf["aws_mobile_analytics_app_id"]) {
      conf = {
        appId: conf["aws_mobile_analytics_app_id"],
      };
    }

    this._config = Object.assign(
      {
        // defaults
        requestIOSPermissions: true, // for backwards compatibility
      },
      this._config,
      conf
    );

    if (isPlatform("capacitor")) {
      this.initializeNotifications();
    }

    this.notificationActionPerformed$.subscribe(actionPerformed => {
      try {
        this.handleCampaignOpened(actionPerformed.notification);
        console.log({ actionPerformed });
      } catch (error) {
        console.error("notificationActionPerformed error", error);
      }
    });

    this.notificationReceived$.subscribe(notification => {
      try {
        this.handleCampaignPush(notification);
        console.log({ notification });
      } catch (error) {
        console.error("notification received error", error);
      }
    });

    App.addListener("appStateChange", ({ isActive }) => {
      this.appState = isActive ? "foreground" : "background";
      if (isActive) {
        this.capPushNotifications
          .getDeliveredNotifications()
          .then(backgroundNotifications => {
            console.log("notifications delivered in the background", {
              backgroundNotifications,
            });
          });
      }
    });
  }

  async initializeNotifications(register = false) {
    const { state } = await Permissions.query({
      name: PermissionType.Notifications,
    });

    if (state === "granted" || register) {
      this.registration$.pipe(take(1)).subscribe(({ value: token }) => {
        this.updateEndpoint(token);
      });
      PushNotifications.register();
    }
  }

  handleCampaignPush(notification: PushNotification) {
    let message = notification;
    let campaign = null;
    if (isPlatform("ios")) {
      message = this.parseMessageFromIOS(notification) as any;
      campaign =
        message && message.data && message.data.pinpoint
          ? message.data.pinpoint.campaign
          : null;
    } else if (isPlatform("android")) {
      const { data } = notification;
      campaign = {
        campaign_id: data["pinpoint.campaign.campaign_id"],
        campaign_activity_id: data["pinpoint.campaign.campaign_activity_id"],
        treatment_id: data["pinpoint.campaign.treatment_id"],
      };
    }

    if (!campaign) {
      logger.debug("no message received for campaign push");
      return;
    }

    const attributes = {
      campaign_activity_id: campaign["campaign_activity_id"],
      isAppInForeground: this.appState === "foreground" ? "true" : "false",
      treatment_id: campaign["treatment_id"],
      campaign_id: campaign["campaign_id"],
    };

    const eventType =
      this.appState === "foreground"
        ? "_campaign.received_foreground"
        : "_campaign.received_background";

    // const eventType = "_campaign.received_background";

    this.recordAnalyticsEvent(eventType, attributes);
  }

  handleCampaignOpened(rawMessage: PushNotification) {
    logger.debug("handleCampaignOpened, raw data", rawMessage);
    let campaign = null;
    if (isPlatform("ios")) {
      const message = this.parseMessageFromIOS(rawMessage) as any;
      campaign =
        message && message.data && message.data.pinpoint
          ? message.data.pinpoint.campaign
          : null;
    } else if (isPlatform("android")) {
      const data = rawMessage;
      campaign = {
        campaign_id: data["pinpoint.campaign.campaign_id"],
        campaign_activity_id: data["pinpoint.campaign.campaign_activity_id"],
        treatment_id: data["pinpoint.campaign.treatment_id"],
      };
    }

    if (!campaign) {
      logger.debug("no message received for campaign opened");
      return;
    }

    const attributes = {
      campaign_activity_id: campaign["campaign_activity_id"],
      treatment_id: campaign["treatment_id"],
      campaign_id: campaign["campaign_id"],
    };

    const eventType = "_campaign.opened_notification";

    this.recordAnalyticsEvent(eventType, attributes);
  }

  async updateEndpoint(token: string) {
    if (!token) {
      logger.debug("no device token recieved on register");
      return;
    }

    if (
      !this.analytics ||
      typeof this.analytics.updateEndpoint !== "function"
    ) {
      logger.debug("Analytics module is not registered into Amplify");
    }

    const { appId } = this._config;
    const cacheKey = "push_token" + appId;
    logger.debug("update endpoint in push notification", token);
    const { value: lastToken } = await Storage.get({ key: cacheKey });

    if (!lastToken || lastToken !== token) {
      logger.debug("refresh the device token with", token);
      const config = {
        Address: token,
        OptOut: "NONE",
        channelType: "APNS_SANDBOX", // "GCM", // "APNS" need to set this as AWS doesn't work this out correctly
      };
      try {
        const data = await this.analytics.updateEndpoint(config);
      } catch (e) {
        // ........
        logger.debug("update endpoint failed", e);
      }
      try {
        logger.debug("update endpoint success, setting token into cache");
        await Storage.set({ key: cacheKey, value: token });
      } catch (e) {
        logger.debug("set device token in cache failed", e);
      }
    }
  }

  parseMessageFromAndroid(message, from?) {
    let dataObj = null;
    try {
      dataObj = message.dataJSON ? JSON.parse(message.dataJSON) : null;
    } catch (e) {
      logger.debug("Failed to parse the data object", e);
      return;
    }

    if (!dataObj) {
      logger.debug("no notification payload received");
      return dataObj;
    }

    if (from === "opened") {
      return dataObj;
    }

    let ret = null;
    const dataPayload = dataObj.data || {};
    if (dataPayload["pinpoint.campaign.campaign_id"]) {
      ret = {
        title: dataPayload["pinpoint.notification.title"],
        body: dataPayload["pinpoint.notification.body"],
        data: dataPayload,
        foreground: dataObj.foreground,
      };
    }
    return ret;
  }

  parseMessageFromIOS({ data = null }: PushNotification) {
    const pinpointData = data && data.data ? data.data : null;
    const alert = data && data.aps && data.aps.alert ? data.aps.alert : {};
    if (!pinpointData && !alert) {
      logger.debug("no notification payload received");
      return {};
    }
    const { title, body } = alert;
    const ret = {
      title,
      body,
      data: pinpointData,
    };
    return ret;
  }

  private recordAnalyticsEvent(eventType: string, attributes: any) {
    if (this.analytics && typeof this.analytics.record === "function") {
      this.analytics.record({
        name: eventType,
        attributes,
        immediate: true,
      });
    } else {
      logger.debug("Analytics module is not registered into Amplify");
    }
  }
}
