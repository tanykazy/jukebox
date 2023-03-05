import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { YoutubeUrlService, reYoutubeUrl } from "../../service/youtube-url.service";


export interface DialogData {
  url: string;
}

class YoutubeValidator {
  static hasVideoid(control: AbstractControl<string, string>): ValidationErrors | null {
    if (control.value && !YoutubeUrlService.getVideoId(control.value)) {
      return {
        'videoid': true
      };
    }
    return null;
  }
}

@Component({
  selector: 'app-request-dialog',
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.css']
})
export class RequestDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.formControl.valueChanges.subscribe((value) => {
      if (!this.formControl.errors && value) {
        this.videoid = YoutubeUrlService.getVideoId(value) || undefined;
      } else {
        this.videoid = undefined;
      }
    });
  }

  videoid: string | undefined;
  width: number = NaN;
  height: number = NaN;
  formControl = new FormControl(this.data.url, [
    Validators.pattern(reYoutubeUrl),
    YoutubeValidator.hasVideoid
  ]);

  public onClickOk(event: UIEvent): void {
    if (!this.formControl.errors) {
      this.data.url = this.formControl.value || '';
    }
  }

  public onClickCancel(event: UIEvent): void {
    this.dialogRef.close();
  }

  public onReady(event: YT.PlayerEvent): void {
    const form = window.document.getElementById('request-form');
    if (form) {
      const size = form.clientWidth;
      this.width = size;
      this.height = size;
    }
  }

  public onError(event: YT.OnErrorEvent): void {
    switch (event.data) {
      case 2:
        console.info('The request contains an invalid parameter value.');
        break;

      case 5:
        console.info('The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.');
        break;

      case 100:
        console.info('The video requested was not found.');
        break;

      case 101:
      case 150:
        console.info('The owner of the requested video does not allow it to be played in embedded players.');
        break;

      default:
        console.warn('Unknown error');
        break;
    }
  }
}
