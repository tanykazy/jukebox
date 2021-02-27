import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { YoutubeUrlService } from "../../service/youtube-url.service";

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
    const requests = event.split('\n');
    for (let request of requests) {
      if (request) {
        const videoid = YoutubeUrlService.getVideoId(request);
        this.submit.emit(videoid);
      }
    }
    this.value = '';
  }

}
