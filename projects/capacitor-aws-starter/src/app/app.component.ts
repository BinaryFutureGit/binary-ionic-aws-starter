import { Component } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { Platform, MenuController } from "@ionic/angular";
import { AmplifyAuthState } from "projects/binary-ionic-aws/src/projects";
import { AmplifyService } from "aws-amplify-angular";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  public appPages = [
    {
      title: "Home",
      url: "/home",
      icon: "home",
    },
    {
      title: "About",
      url: "/about",
      icon: "information-circle",
    },
  ];

  constructor(
    private platform: Platform,
    public authState: AmplifyAuthState,
    public amplify: AmplifyService,
    private menuCtrl: MenuController,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      Plugins.SplashScreen.hide();
    });
  }

  closeMenu() {
    // this.router.navigate(["login"]);
    this.menuCtrl.close();
  }

  logoutButton() {
    this.amplify.auth().signOut();
    this.router.navigate(["home"]);
    this.menuCtrl.close();
  }
}
