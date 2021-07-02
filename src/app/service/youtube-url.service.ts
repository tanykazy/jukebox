import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YoutubeUrlService {

  constructor() { }

  /**
   * getVideoId
   */
  static getVideoId(url: string): string | null {
    try {
      const addr = new URL(url);
      const hostname = addr.hostname;
      if (hostname === 'youtu.be') {
        return addr.pathname.replace('/', '');
      } else {
        const searchParams = addr.searchParams;
        return searchParams.get('v');
      }
    } catch (error) {
      return null;
    }
  }
}
