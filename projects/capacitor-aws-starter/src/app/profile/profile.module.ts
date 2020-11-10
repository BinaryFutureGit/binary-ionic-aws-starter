import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import {
  AmplifyLoggedInUserGuard,
  CapacitorAmplifyModule,
} from "projects/binary-ionic-aws/src/projects";
import { ProfilePage } from "./profile.page";
import { AmplifyAngularModule, AmplifyIonicModule } from "aws-amplify-angular";

@NgModule({
  imports: [
    AmplifyAngularModule,
    AmplifyIonicModule,
    CapacitorAmplifyModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: "",
        component: ProfilePage,
        canActivate: [AmplifyLoggedInUserGuard],
      },
    ]),
  ],
  declarations: [ProfilePage],
})
export class ProfilePageModule {}
