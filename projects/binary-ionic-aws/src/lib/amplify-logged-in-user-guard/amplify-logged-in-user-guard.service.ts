import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { map } from "rxjs/operators";
import { AmplifyAuthState } from "../amplify-auth-state/amplify-auth-state.service";

@Injectable({
  providedIn: "root",
})
export class AmplifyLoggedInUserGuard implements CanActivate {
  constructor(private authState: AmplifyAuthState, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authState.currentUser$.pipe(
      map(user => {
        if (user) {
          return true;
        } else {
          // TODO
          // need to work out how to do redirect
          // this.router.navigate(["/login"], {
          //   queryParams: {
          //     redirect: encodeURIComponent(state.url),
          //   },
          // });
          return false;
        }
      })
    );
  }
}
