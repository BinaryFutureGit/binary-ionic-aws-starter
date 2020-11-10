import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import {
  AmplifyAngularModule,
  AmplifyIonicModule,
  AmplifyService,
} from "aws-amplify-angular";
import { CapacitorAmplifyModule } from "projects/binary-ionic-aws/src/projects";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    AmplifyAngularModule,
    AmplifyIonicModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    CapacitorAmplifyModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AmplifyService,
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
