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
      const addr: URL = new URL(url);
      const hostname: string = addr.hostname;
      if (hostname === 'youtu.be') {
        return addr.pathname.replace('/', '');
      } else {
        const searchParams: URLSearchParams = addr.searchParams;
        return searchParams.get('v');
      }
    } catch (error) {
      console.warn(error);
      return null;
    }
  }
}
