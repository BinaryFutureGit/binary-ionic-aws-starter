import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { ResetPasswordPage } from "./reset-password.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: "",
        component: ResetPasswordPage,
      },
    ]),
  ],
  declarations: [ResetPasswordPage],
})
export class ResetPasswordPageModule {}
