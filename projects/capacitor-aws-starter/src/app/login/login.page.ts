import { Component, OnInit } from "@angular/core";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { AmplifyService } from "aws-amplify-angular";
import {
  FormGroup,
  ValidationErrors,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { AlertController } from "@ionic/angular";
import { AmplifyAuthState } from "projects/binary-ionic-aws/src/projects";
import { Router } from "@angular/router";
import { ProfileDataProvider } from "../core/services/profile-data";
import { Binary } from "selenium-webdriver/firefox";

// sign up form fields start
const FIELD_NAME = "name";
const FIELD_EMAIL = "email";
const FIELD_PASSWORD = "password";
const FIELD_CONFIRM_PASSWORD = "confirmPassword";
const FIELD_GENDER = "gender";
const FIELD_BIRTH_DATE = "birthdate";

// sign up form error messages
const ERR_EMAIL_EXISTS = "This email has already been used.";
const ERR_MIN_LENGTH = "Passwords must be at least 6 characters.";
const ERR_PASSWORDS_MATCH = "Passwords Do No Match";
const ERR_EMAIL = "Please enter a valid email.";
const ERR_ENTER_PASSWORD = "Please enter a password";
const ERR_INVALID_EMAIL = "Please enter a valid email address";
const ERR_ENTER_EMAIL = "Please enter an email address";
const ERR_ENTER_NAME = "Please enter your name.";

export interface SignInWithDetails {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  birthdate?: string;
  gender?: string;
}

@Component({
  selector: "app-login",
  templateUrl: "login.page.html",
  styleUrls: ["login.page.scss"],
})
export class LoginPage implements OnInit {
  ionicStarterAccountSearchBarValue = "signUp";
  ionicStarterLoginForm: FormGroup;
  ionicStarterSignUpForm: FormGroup;
  email = "";

  constructor(
    public amplify: AmplifyService,
    public alertCtrl: AlertController,
    public authState: AmplifyAuthState,
    private formBuilder: FormBuilder,
    private profileDataProvider: ProfileDataProvider,
    private router: Router
  ) {
    this.ionicStarterLoginForm = this.formBuilder.group({
      [FIELD_EMAIL]: [
        this.profileDataProvider.getEmail(),
        [Validators.required, Validators.email],
      ],
      [FIELD_PASSWORD]: ["", [Validators.required, Validators.minLength(8)]],
    });

    this.ionicStarterSignUpForm = this.formBuilder.group({
      [FIELD_NAME]: ["", [Validators.required]],
      [FIELD_GENDER]: [""],
      [FIELD_BIRTH_DATE]: [""],
      [FIELD_EMAIL]: ["", [Validators.required, Validators.email]],
      [FIELD_PASSWORD]: [
        "",
        Validators.compose([Validators.minLength(6), Validators.required]),
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

    this.fieldEmailLogin.valueChanges
      .pipe()
      .subscribe(email => this.profileDataProvider.setEmail(email));
  }

  get fieldEmailLogin() {
    return (
      this.ionicStarterLoginForm && this.ionicStarterLoginForm.get(FIELD_EMAIL)
    );
  }

  get fieldPassword() {
    return (
      this.ionicStarterLoginForm &&
      this.ionicStarterLoginForm.get(FIELD_PASSWORD)
    );
  }

  get fieldSignUpName() {
    return (
      this.ionicStarterSignUpForm && this.ionicStarterSignUpForm.get(FIELD_NAME)
    );
  }
  get fieldSignUpEmail() {
    return (
      this.ionicStarterSignUpForm &&
      this.ionicStarterSignUpForm.get(FIELD_EMAIL)
    );
  }
  get fieldSignUpPassword() {
    return (
      this.ionicStarterSignUpForm &&
      this.ionicStarterSignUpForm.get(FIELD_PASSWORD)
    );
  }
  get fieldSignUpConfirmPassword() {
    return (
      this.ionicStarterSignUpForm &&
      this.ionicStarterSignUpForm.get(FIELD_CONFIRM_PASSWORD)
    );
  }

  ngOnInit() {}

  logInFacebook() {
    this.amplify.auth().federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Facebook,
    });
  }

  logInGoogle() {
    this.amplify.auth().federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Google,
    });
  }

  logout() {}

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

  errMsgPassword(errMsgPassword: ValidationErrors) {
    if (errMsgPassword.required) {
      return ERR_ENTER_PASSWORD;
    } else if (errMsgPassword.minlength) {
      return ERR_MIN_LENGTH;
    } else if (errMsgPassword.value) {
      return ERR_PASSWORDS_MATCH;
    }
  }

  async showEmailErrors(form) {
    const alert = await this.alertCtrl.create({
      header: "Error",
      subHeader: ERR_INVALID_EMAIL,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
    return alert.present();
  }

  errMsgEmail(errMsgEmail: ValidationErrors) {
    if (errMsgEmail.required && errMsgEmail.email) {
      return ERR_ENTER_EMAIL;
    } else {
      return ERR_INVALID_EMAIL;
    }
  }

  async loginWithDetails(signUp?: boolean) {
    let loginFormData: SignInWithDetails = {
      email: this.fieldEmailLogin.value,
      password: this.fieldPassword.value,
    };

    if (signUp) {
      loginFormData = {
        email: this.fieldSignUpName.value,
        password: this.fieldSignUpPassword.value,
      };
    }

    try {
      const signInResponse = await this.amplify
        .auth()
        .signIn(loginFormData.email, loginFormData.password);

      this.router.navigate(["profile"]);
    } catch (err) {
      err;
    }
  }

  async showSignUpNameErrors() {
    const alert = await this.alertCtrl.create({
      header: "Error",
      subHeader: ERR_ENTER_NAME,
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

  async signUpWithDetails() {
    const signUpFormData: SignUpData = {
      name: this.fieldSignUpName.value,
      email: this.fieldSignUpEmail.value,
      birthdate:
        this.ionicStarterSignUpForm
          .get([FIELD_BIRTH_DATE])
          .value.split("T")[0] || "00/00/0000",
      gender: this.ionicStarterSignUpForm.get([FIELD_GENDER]).value || "null",
    };

    try {
      const signUpResponse = await this.amplify.auth().signUp({
        username: this.fieldSignUpEmail.value,
        password: this.fieldSignUpPassword.value,
        attributes: signUpFormData,
        email_verfied: "true",
      });

      if (signUpResponse) {
        await new Promise(resolve => setTimeout(() => resolve(), 500));
        this.loginWithDetails(true);
      }
    } catch (err) {
      if (err.code === "UsernameExistsException") {
        const alert = await this.alertCtrl.create({
          header: "Error",
          subHeader: ERR_EMAIL_EXISTS,
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

  confirmPasswordValidationCheck() {
    return this.fieldSignUpPassword &&
      this.fieldSignUpConfirmPassword &&
      this.fieldSignUpPassword.value === this.fieldSignUpConfirmPassword.value
      ? null
      : { value: ERR_PASSWORDS_MATCH };
  }

  async forgotPassword() {
    this.router.navigate(["reset-password"], {});
  }
}
