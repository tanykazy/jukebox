import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  constructor() { }

  private list: Array<string> = [];

  /**
   * addList
   */
  public addList(url: string) {
    if (!this.list.includes(url)) {
      this.list.push(url);
      // StorageService.setItem('playlist', this.list);
    }
  }

  /**
   * getShuffle
   */
  public getShuffle() {
    const random = Math.floor(Math.random() * this.list.length);
    const url = this.list.splice(random, 1)[0];
    // StorageService.setItem('playlist', this.list);
    return url;
  }

}
