import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  FormGroup,
  ValidationErrors,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { AmplifyService } from "aws-amplify-angular";
import { AlertController, ToastController } from "@ionic/angular";
import { ProfileDataProvider } from "../core/services/profile-data";
import { untilDestroyed } from "ngx-take-until-destroy";
import { AuthClass } from "aws-amplify";
import { Router } from "@angular/router";

const FIELD_PASSWORD = "password";
const FIELD_CURR_PASSWORD = "current_password";
const FIELD_CONFIRM_PASSWORD = "confirmPassword";

const PASSWORD_CHANGED = "Password has been changed.";
const ERR_LIMIT = "Attempt limit exceeded, please try after some time.";
const ERR_INCORRECT_PASSWORD = "Incorrect password entered.";
const ERR_ENTER_PASSWORD = "Please enter a password";
const ERR_MIN_LENGTH = "Passwords must be at least 6 characters.";
const ERR_PASSWORDS_MATCH = "Passwords Do No Match";

@Component({
  selector: "app-list",
  templateUrl: "change-password.page.html",
  styleUrls: ["change-password.page.scss"],
})
export class ChangePasswordPage {
  private amplifyAuth: AuthClass = this.amplify.auth();
  ionicStarterPasswordForm: FormGroup;

  constructor(
    public alertCtrl: AlertController,
    public amplify: AmplifyService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.ionicStarterPasswordForm = this.formBuilder.group({
      [FIELD_CURR_PASSWORD]: ["", [Validators.required]],
      [FIELD_PASSWORD]: [
        "",
        Validators.compose([Validators.minLength(8), Validators.required]),
      ],
      [FIELD_CONFIRM_PASSWORD]: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          this.confirmPasswordValidationCheck.bind(this),
        ],
      ],
    });
  }

  get fieldProfilePassword() {
    return (
      this.ionicStarterPasswordForm &&
      this.ionicStarterPasswordForm.get(FIELD_CURR_PASSWORD)
    );
  }
  get fieldProfileConfirmPassword() {
    return (
      this.ionicStarterPasswordForm &&
      this.ionicStarterPasswordForm.get(FIELD_CONFIRM_PASSWORD)
    );
  }

  confirmPasswordValidationCheck() {
    return this.fieldProfilePassword &&
      this.fieldProfileConfirmPassword &&
      this.fieldProfilePassword.value === this.fieldProfileConfirmPassword.value
      ? null
      : { value: ERR_PASSWORDS_MATCH };
  }

  errMsgPassword(errMsgPassword: ValidationErrors) {
    if (errMsgPassword) {
      if (errMsgPassword.required) {
        return ERR_ENTER_PASSWORD;
      } else if (errMsgPassword.minlength) {
        return ERR_MIN_LENGTH;
      } else if (errMsgPassword.value) {
        return ERR_PASSWORDS_MATCH;
      }
    }
  }

  async showPasswordErrors(form: FormGroup) {
    const passwordErr = form.get(FIELD_PASSWORD).errors;
    const alert = await this.alertCtrl.create({
      header: "Error",
      subHeader: this.errMsgPassword(passwordErr),
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
    return alert.present();
  }

  async showConfirmPasswordErrors(form) {
    const passwordErr = form.get(FIELD_CONFIRM_PASSWORD).errors;
    const alert = await this.alertCtrl.create({
      header: "Error",
      subHeader: this.errMsgPassword(passwordErr),
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
    alert.present();
  }

  async updateDetails() {
    const user = await this.amplifyAuth.currentAuthenticatedUser();
    if (this.ionicStarterPasswordForm.get([FIELD_PASSWORD]).value) {
      try {
        await this.amplify
          .auth()
          .changePassword(
            user,
            this.ionicStarterPasswordForm.get([FIELD_CURR_PASSWORD]).value,
            this.ionicStarterPasswordForm.get([FIELD_PASSWORD]).value
          );
        const alert = await this.alertCtrl.create({
          header: "Error",
          subHeader: PASSWORD_CHANGED,
          buttons: [
            {
              text: "Ok",
              role: "cancel",
            },
          ],
        });
        alert.present();
        this.router.navigate(["profile"]);
      } catch (err) {
        if (err.code === "LimitExceededException") {
          const alert = await this.alertCtrl.create({
            header: "Error",
            subHeader: ERR_LIMIT,
            buttons: [
              {
                text: "Ok",
                role: "cancel",
              },
            ],
          });
          alert.present();
        } else {
          const alert = await this.alertCtrl.create({
            header: "Error",
            subHeader: ERR_INCORRECT_PASSWORD,
            buttons: [
              {
                text: "Ok",
                role: "cancel",
              },
            ],
          });
          alert.present();
        }
      }
    }
  }
}
