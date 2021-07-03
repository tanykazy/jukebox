import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { YoutubeUrlService } from "../../service/youtube-url.service";

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  @Output() submit = new EventEmitter();

  value = '';

  // keywords = new Set(['angular', 'how-to', 'tutorial']);
  keywords: Set<string> = new Set([]);
  // keywords = [];
  // formControl: FormControl = new FormControl(['angular']);
  // formControl: FormControl = new FormControl();

  readonly selectable = true;
  readonly removable = true;
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor() {
  }

  ngOnInit(): void {
  }

  public onSubmit(event: any): void {
    const requests: Array<string> = event.split(/\r\n|\r|\n|\s/);
    for (let request of requests) {
      if (request) {
        const videoid = YoutubeUrlService.getVideoId(request);
        this.submit.emit(videoid);
      }
    }
    this.value = '';
  }

  public addKeywordFromInput(event: MatChipInputEvent) {
    if (event.value) {
      const requests = event.value.split(/\r\n|\r|\n|\s/);
      for (let request of requests) {
        const videoid = YoutubeUrlService.getVideoId(request);
        if (videoid) {
          this.keywords.add(videoid);
          // this.submit.emit(videoid);
        }
      }
      event.chipInput!.clear();
    }
  }

  public remove(keyword: string): void {
    this.keywords.delete(keyword);
  }
}
