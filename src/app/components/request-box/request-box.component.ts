import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { YoutubeUrlService } from "../../service/youtube-url.service";
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  @Output() submit = new EventEmitter();

  value = '';

  constructor() {
  }

  ngOnInit(): void {
  }

  public onSubmit(event: any): void {
    const requests = event.split(/\r\n|\r|\n|\s/);
    for (let request of requests) {
      if (request) {
        const videoid = YoutubeUrlService.getVideoId(request);
        this.submit.emit(videoid);
      }
    }
    this.value = '';
  }

  keywords = new Set(['angular', 'how-to', 'tutorial']);
  formControl = new FormControl(['angular']);

  addKeywordFromInput(event: MatChipInputEvent) {
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

  removeKeyword(keyword: string) {
    this.keywords.delete(keyword);
  }
}
