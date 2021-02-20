import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  @Output() submit = new EventEmitter();

  constructor() {
  }

  value = '';

  ngOnInit(): void {
  }

}
