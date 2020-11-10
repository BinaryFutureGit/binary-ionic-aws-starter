import { Component, NgZone, OnInit } from "@angular/core";
import { wrapInZone } from "@binary-dev/ionic-helpers";
import CapacitorAmplifyPushNotifications from "projects/binary-ionic-aws/src/lib/capacitor-amplify-push-notifications/capcitor-amplify-push-notifications";
import { HttpClient } from "@angular/common/http";
import { AmplifyService } from "aws-amplify-angular";
import { AuthClass } from "@aws-amplify/auth";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-push-notifications",
  templateUrl: "./push-notifications.page.html",
  styleUrls: ["./push-notifications.page.scss"],
})
export class PushNotificationsPage implements OnInit {
  // notificationPermissionState$ = this.capPushNotifications.notificationPermission$.pipe(
  //   wrapInZone(this.zone)
  // );

  constructor(
    // public capPushNotifications: CapacitorAmplifyPushNotifications,
    private zone: NgZone,
    private http: HttpClient,
    private amplify: AmplifyService
  ) {}

  ngOnInit() {}

  // registerForNotifications() {
  //   this.capPushNotifications.initializeNotifications(true);
  // }

  async sendTestPush() {
    const session = await (this.amplify.auth() as AuthClass).currentSession();
    const idToken = session.getIdToken().getJwtToken();

    this.http
      .post(
        environment.apiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      )
      .subscribe(response => console.log(response));
  }
}
