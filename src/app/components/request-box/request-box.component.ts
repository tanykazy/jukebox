import { Component, OnInit, Output, EventEmitter } from '@angular/core';

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
        this.submit.emit(request);
      }
    }
    this.value = '';
  }

}
