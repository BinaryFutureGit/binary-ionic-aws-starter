import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { AlertController } from "@ionic/angular";
import { AuthClass } from "aws-amplify";
import { AmplifyService } from "aws-amplify-angular";
import { AmplifyAuthState } from "projects/binary-ionic-aws/src/projects";

// profile form fields start
const FIELD_NAME = "name";
const FIELD_EMAIL = "email";
const FIELD_GENDER = "gender";
const FIELD_BIRTH_DATE = "birthdate";

// profile form error messages
const ERR_EMAIL = "Please enter a valid email.";
const ERR_INVALID_EMAIL = "Please enter a valid email address";
const ERR_ENTER_EMAIL = "Please enter an email address";
const ERR_ENTER_NAME = "Please enter your name.";

export interface ProfileData {
  email: string;
  name: string;
  birthdate?: string;
  gender?: string;
  picture?: string;
}

@Component({
  selector: "app-list",
  templateUrl: "profile.page.html",
  styleUrls: ["profile.page.scss"],
})
export class ProfilePage implements OnInit {
  user;
  ionicStarterProfileForm: FormGroup;
  userId = "";
  name = "";
  email = "";
  birthdate = "";
  gender;
  picture: string = null;
  loggedInVia = "";

  private amplifyAuth: AuthClass = this.amplify.auth();

  constructor(
    public alertCtrl: AlertController,
    public amplify: AmplifyService,
    public authState: AmplifyAuthState,
    private formBuilder: FormBuilder
  ) {
    this.ionicStarterProfileForm = this.formBuilder.group({
      [FIELD_NAME]: ["", [Validators.required]],
      [FIELD_GENDER]: [""],
      [FIELD_BIRTH_DATE]: [""],
      [FIELD_EMAIL]: ["", [Validators.required, Validators.email]],
    });
  }

  async ngOnInit() {
    this.user = await this.amplifyAuth.currentAuthenticatedUser();

    const creds = await this.amplifyAuth.currentUserCredentials();
    const userAttributes = this.amplify
      .auth()
      .userAttributes(this.user)
      .then(userAttributesVal => {
        userAttributesVal.forEach(item => {
          switch (item.Name) {
            case "sub": {
              this.userId = item.Value;
              break;
            }
            case "name": {
              this.name = item.Value;
              break;
            }
            case "email": {
              this.email = item.Value;
              break;
            }
            case "birthdate": {
              this.birthdate = item.Value;
              break;
            }
            case "gender": {
              this.gender = item.Value;
              break;
            }
            case "picture": {
              this.picture = item.Value;
              break;
            }
            case "identities": {
              const identities = JSON.parse(item.Value);
              this.loggedInVia = identities[0].providerType;
              break;
            }
            default: {
              break;
            }
          }
        });
      });
  }

  get fieldProfileName() {
    return (
      this.ionicStarterProfileForm &&
      this.ionicStarterProfileForm.get(FIELD_NAME)
    );
  }
  get fieldProfileEmail() {
    return (
      this.ionicStarterProfileForm &&
      this.ionicStarterProfileForm.get(FIELD_EMAIL)
    );
  }

  async showProfileNameErrors() {
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

  async onImageUploaded(e) {
    this.picture = e.key;
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

  async updateDetails() {
    const profileFormData: ProfileData = {
      email: this.fieldProfileEmail.value,
      name: this.fieldProfileName.value,
      birthdate:
        this.ionicStarterProfileForm
          .get([FIELD_BIRTH_DATE])
          .value.split("T")[0] || "00/00/0000",
      gender: this.ionicStarterProfileForm.get([FIELD_GENDER]).value || "null",
      picture: this.picture || "null",
    };
    try {
      await this.amplifyAuth.updateUserAttributes(this.user, profileFormData);
    } catch (err) {
      // console.log(err);
    }
    this.authState.refreshUser();
  }
}
