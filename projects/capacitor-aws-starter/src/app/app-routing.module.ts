import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadChildren: () =>
      import("./home/home.module").then(m => m.HomePageModule),
  },
  {
    path: "about",
    loadChildren: () =>
      import("./about/about.module").then(m => m.AboutPageModule),
  },
  {
    path: "profile",
    loadChildren: () =>
      import("./profile/profile.module").then(m => m.ProfilePageModule),
  },
  {
    path: "login",
    loadChildren: () =>
      import("./login/login.module").then(m => m.LoginPageModule),
  },
  {
    path: "change-password",
    loadChildren: () =>
      import("./change-password/change-password.module").then(
        m => m.ChangePasswordPageModule
      ),
  },
  {
    path: "reset-password",
    loadChildren: () =>
      import("./reset-password/reset-password.module").then(
        m => m.ResetPasswordPageModule
      ),
  },
  {
    path: "push-notifications",
    loadChildren: () =>
      import("./push-notifications/push-notifications.module").then(
        m => m.PushNotificationsPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
