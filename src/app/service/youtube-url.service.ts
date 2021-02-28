import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YoutubeUrlService {

  constructor() { }

  /**
   * getVideoId
   */
  static getVideoId(url: string) {
    const addr = new URL(url);
    const hostname = addr.hostname;
    let v;
    if (hostname === 'youtu.be') {
      v = addr.pathname;
    } else {
      const searchParams = addr.searchParams;
      v = searchParams.get('v');
    }
    return v;
  }
}

