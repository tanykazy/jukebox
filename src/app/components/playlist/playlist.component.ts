import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  @Output() select = new EventEmitter();

  playlist: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  onSelectionChange(event: any): void {
    const value = event.options[0].value;
    const index = this.playlist.indexOf(value);
    if (index !== -1) {
      this.playlist.splice(index, 1);
      this.emitSelect(value);
    }
  }

  private emitSelect(value: string) {
    this.select.emit(value);
  }

  /**
   * addList
   */
  public addList(url: string) {
    if (!this.playlist.includes(url)) {
      this.playlist.push(url);
    }
  }

  /**
   * getShuffle
   */
  public getShuffle() {
    const random = Math.floor(Math.random() * this.playlist.length);
    const url = this.playlist.splice(random, 1)[0];
    return url;
  }

}
