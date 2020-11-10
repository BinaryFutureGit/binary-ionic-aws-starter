import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ProfileDataProvider {
  public ZelEmail = "";
  constructor() {}

  setEmail(email: string) {
    this.ZelEmail = email;
  }

  getEmail() {
    return this.ZelEmail;
  }
}
