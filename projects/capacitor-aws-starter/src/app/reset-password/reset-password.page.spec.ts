import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { ResetPasswordPage } from "./reset-password.page";

describe("AboutPage", () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let resetPasswordPage: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResetPasswordPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have a list of 10 elements", () => {
    resetPasswordPage = fixture.nativeElement;
    const items = resetPasswordPage.querySelectorAll("ion-item");
    expect(items.length).toEqual(10);
  });
});
