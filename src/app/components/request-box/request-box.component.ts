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
    const requests = event.split(/\r\n|\r|\n|\s/);
    for (let request of requests) {
      if (request) {
        const videoid = YoutubeUrlService.getVideoId(request);
        this.submit.emit(videoid);
      }
    }
    this.value = '';
  }

}

/*
https://www.youtube.com/watch?v=0zUE1E3e7Mg
https://www.youtube.com/watch?v=j7BQRPSOIeA
https://www.youtube.com/watch?v=OlqC1BBVk70
https://www.youtube.com/watch?v=h2FxhiY7qGg
https://www.youtube.com/watch?v=rk_yhS3YnIo
https://www.youtube.com/watch?v=fpaq_2Qk9Zg
https://www.youtube.com/watch?v=qJCv23IjDAI
*/