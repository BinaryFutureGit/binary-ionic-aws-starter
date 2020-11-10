import {
  ChangeDetectorRef,
  Directive,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { StorageClass } from "@aws-amplify/storage";
import { AmplifyService } from "aws-amplify-angular";

@Directive({
  selector: "[amplifyFile]",
})
export class AmplifyFileDirective implements OnChanges {
  private s3Url: string;
  @HostBinding("src") get imageSrc() {
    return this.s3Url || this.defaultSrc;
  }
  @Input() amplifyFile: string;
  @Input() options: { level: "public" | "protected" | "private" };
  @Input() defaultSrc: string;

  constructor(
    private amplify: AmplifyService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.amplifyFile) {
      this.getImage();
    }
  }

  getImage() {
    (this.amplify.storage() as StorageClass)
      .get(this.amplifyFile, this.options)
      .then((url: string) => {
        this.s3Url = url;
        this.cdRef.markForCheck();
      })
      .catch(e => console.error(e));
  }
}
