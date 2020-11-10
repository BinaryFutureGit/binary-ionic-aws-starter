import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { ChangePasswordPage } from "./change-password.page";

describe("AboutPage", () => {
  let component: ChangePasswordPage;
  let fixture: ComponentFixture<ChangePasswordPage>;
  let changePasswordPage: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangePasswordPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have a list of 10 elements", () => {
    changePasswordPage = fixture.nativeElement;
    const items = changePasswordPage.querySelectorAll("ion-item");
    expect(items.length).toEqual(10);
  });
});
