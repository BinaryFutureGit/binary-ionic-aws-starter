import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";

import { LoginPage } from "./login.page";
import { AmplifyIonicModule, AmplifyAngularModule } from "aws-amplify-angular";

@NgModule({
  imports: [
    AmplifyAngularModule,
    AmplifyIonicModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: "",
        component: LoginPage,
      },
    ]),
  ],
  declarations: [LoginPage],
})
export class LoginPageModule {}
