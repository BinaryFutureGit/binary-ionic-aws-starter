import { Injectable, NgZone } from "@angular/core";
import { AuthClass, CognitoUser } from "@aws-amplify/auth";
import { HubCapsule } from "@aws-amplify/core/lib-esm/Hub";
import { wrapInZone } from "@binary-dev/ionic-helpers";
import { AmplifyService } from "aws-amplify-angular";
import { BehaviorSubject, merge } from "rxjs";
import {
  concatMap,
  filter,
  mapTo,
  shareReplay,
  switchMap,
  tap,
} from "rxjs/operators";
import { bindHub } from "../bind-amplify-hub/bind-amplify-hub";

@Injectable({ providedIn: "root" })
export class AmplifyAuthState {
  private amplifyAuth: AuthClass = this.amplify.auth();
  private authHub$ = bindHub("auth").pipe(wrapInZone(this.zone));
  private updateUserAttributes = new BehaviorSubject<{ bypassCache: boolean }>({
    bypassCache: false,
  });

  logIn$ = this.authHub$.pipe(
    filter(capsule => capsule.payload.event === "signIn"),
    concatMap(
      () => this.amplifyAuth.currentAuthenticatedUser() as Promise<CognitoUser>
    )
  );
  logOut$ = this.authHub$.pipe(
    filter(capsule => capsule.payload.event === "signOut"),
    mapTo<HubCapsule, null>(null)
  );

  currentUser$ = merge(
    this.updateUserAttributes.pipe(
      switchMap(
        ({ bypassCache }) =>
          this.amplifyAuth
            .currentAuthenticatedUser({ bypassCache })
            .catch(() => null) as Promise<CognitoUser>
      )
    ),
    this.logIn$,
    this.logOut$
  ).pipe(
    tap(user => console.log({ user })),
    shareReplay(1)
  );

  constructor(private amplify: AmplifyService, private zone: NgZone) {}

  refreshUser() {
    this.updateUserAttributes.next({ bypassCache: true });
  }
}
