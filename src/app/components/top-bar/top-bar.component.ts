import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { MatSliderChange } from "@angular/material/slider";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  @Input() appName: string | undefined;

  @Input() volume: number = 0;
  @Output() volumeChange: EventEmitter<number> = new EventEmitter();
  @Input() muted: boolean = false;
  @Output() mutedChange: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onInputSlider(event: MatSliderChange): void {
    if (event.value !== null) {
      this.volume = event.value;
      this.volumeChange.emit(this.volume);
    }
  }

  onClickVolume(event: UIEvent): void {
    this.muted = !this.muted;
    this.mutedChange.emit(this.muted);
  }
}
