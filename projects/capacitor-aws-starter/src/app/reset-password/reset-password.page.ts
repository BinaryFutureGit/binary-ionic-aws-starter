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

const FIELD_EMAIL = "email";
const FIELD_CODE = "code";
const FIELD_PASSWORD = "newPassword";
const FIELD_CONFIRM_PASSWORD = "confirmPassword";

const PASSWORD_RESET_SUCCEESS_MESSAGE = "Password has been reset.";

const ENTER_PASSWORD = "Enter your password.";
const ERR_EMAIL_NOT_FOUND = "Email address not found.";
const ERR_TOAST_DURATION = 3000;
const ERR_PASSWORD_LENGTH = "Password must be a least 6 characters.";
const ERR_PASSWORD_DONT_MATCH = "Password don't match.";
const ENTER_CODE = "Enter code.";
const ERR_INVALID_EMAIL = "Invalid email";
const ENTER_EMAIL = "Enter email address;";

@Component({
  selector: "app-list",
  templateUrl: "reset-password.page.html",
  styleUrls: ["reset-password.page.scss"],
})
export class ResetPasswordPage implements OnInit, OnDestroy {
  public ionicStarterForgotPasswordForm: FormGroup;
  public ionicStarterForgotPasswordSubmitForm: FormGroup;
  public showForgotSubmitFormData = false;
  public passwordResetInProgress = false;
  public passwordSubmitInProgress = false;
  public get fieldEmail() {
    return (
      this.ionicStarterForgotPasswordForm &&
      this.ionicStarterForgotPasswordForm.get(FIELD_EMAIL)
    );
  }
  public get fieldCode() {
    return (
      this.ionicStarterForgotPasswordSubmitForm &&
      this.ionicStarterForgotPasswordSubmitForm.get(FIELD_CODE)
    );
  }
  public get fieldNewPassword() {
    return (
      this.ionicStarterForgotPasswordSubmitForm &&
      this.ionicStarterForgotPasswordSubmitForm.get(FIELD_PASSWORD)
    );
  }
  public get fieldConfirmPassword() {
    return (
      this.ionicStarterForgotPasswordSubmitForm &&
      this.ionicStarterForgotPasswordSubmitForm.get(FIELD_CONFIRM_PASSWORD)
    );
  }

  constructor(
    public alertCtrl: AlertController,
    public amplify: AmplifyService,
    private formBuilder: FormBuilder,

    private profileDataProvider: ProfileDataProvider,
    public toastCtrl: ToastController
  ) {
    this.ionicStarterForgotPasswordForm = this.formBuilder.group({
      [FIELD_EMAIL]: [
        this.profileDataProvider.getEmail(),
        [Validators.email, Validators.required],
      ],
    });
    this.ionicStarterForgotPasswordSubmitForm = this.formBuilder.group({
      [FIELD_CODE]: ["", [Validators.required]],
      [FIELD_PASSWORD]: ["", [Validators.required, Validators.minLength(6)]],
      [FIELD_CONFIRM_PASSWORD]: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          this.confirmPasswordValidationCheck.bind(this),
        ],
      ],
    });

    this.fieldEmail.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(email => this.profileDataProvider.setEmail(email));
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async resetPassword() {
    this.passwordSubmitInProgress = true;
    const email = this.fieldEmail.value;

    const code: string = this.fieldCode.value.toString();

    const password = this.fieldNewPassword.value;

    try {
      await this.amplify.auth().forgotPasswordSubmit(email, code, password);
      this.passwordSubmitInProgress = false;
      this.showSuccessMessageToast();
    } catch (err) {
      this.passwordSubmitInProgress = false;
      if (
        err.message !== "Invalid verification code provided, please try again."
      ) {
        this.showForgotSubmitFormData = false;
      }

      this.showErrMessageToast(err.message);
    }
  }

  async sendCode() {
    const email = this.fieldEmail.value;
    if (email) {
      this.passwordResetInProgress = true;

      try {
        const forgotPasswordResponse = await this.amplify
          .auth()
          .forgotPassword(email);
        if (forgotPasswordResponse) {
          this.showForgotSubmitFormData = true;
          this.passwordResetInProgress = false;
        }
      } catch (err) {
        this.passwordResetInProgress = false;
        if (err.message === "Username/client id combination not found.") {
          err.message = ERR_EMAIL_NOT_FOUND;
        }

        this.showErrMessageToast(err.message);
      }
    }
  }

  // validation error message functions start

  errMsgPassword(errMsgPassword: ValidationErrors) {
    if (errMsgPassword.required) {
      return ENTER_PASSWORD;
    } else if (errMsgPassword.minlength) {
      return ERR_PASSWORD_LENGTH;
    } else if (errMsgPassword.value) {
      return ERR_PASSWORD_DONT_MATCH;
    }
  }

  errMsgEmail(errMsgEmail: ValidationErrors) {
    if (errMsgEmail.required && errMsgEmail.email) {
      return ENTER_EMAIL;
    } else if (errMsgEmail.email) {
      return ERR_INVALID_EMAIL;
    }
  }

  showEmailErrors(form) {
    let emailErr = form.get([FIELD_EMAIL]).errors;
    const errMsgEmail = this.errMsgEmail(emailErr);
    this.showAlertBox(errMsgEmail);
  }

  errMsgCode(errCode: ValidationErrors) {
    if (errCode.required) {
      return ENTER_CODE;
    }
  }

  showCodeErrors(form) {
    let codeErr = form.get([FIELD_CODE]).errors;
    const errMsgCode = this.errMsgCode(codeErr);
    this.showAlertBox(errMsgCode);
  }

  showPasswordErrors(form) {
    let passwordErr = form.get([FIELD_PASSWORD]).errors;
    const errMsgPassword = this.errMsgPassword(passwordErr);
    this.showAlertBox(errMsgPassword);
  }

  showConfirmPasswordErrors(form) {
    let passwordErr = form.get([FIELD_CONFIRM_PASSWORD]).errors;
    const errMsgPassword = this.errMsgPassword(passwordErr);
    this.showAlertBox(errMsgPassword);
  }

  confirmPasswordValidationCheck() {
    return this.fieldNewPassword &&
      this.fieldConfirmPassword &&
      this.fieldNewPassword.value === this.fieldConfirmPassword.value
      ? null
      : { value: ERR_PASSWORD_DONT_MATCH };
  }

  //validation error message functions end

  async showErrMessageToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: ERR_TOAST_DURATION,
      position: "top",
      cssClass: "zel-err-toast",
      showCloseButton: true,
    });
    if (msg != null) {
      await toast.present();
    }
  }

  async showSuccessMessageToast() {
    const toast = await this.toastCtrl.create({
      message: PASSWORD_RESET_SUCCEESS_MESSAGE,
      duration: ERR_TOAST_DURATION,
      cssClass: "actionErrToast",
      position: "top",
      showCloseButton: true,
    });
    await toast.present();
  }

  async showAlertBox(message: string) {
    const alert = await this.alertCtrl.create({
      header: "Error",
      subHeader: message,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
    if (message != "") {
      await alert.present();
    }
  }
}
