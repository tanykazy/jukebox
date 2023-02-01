import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YoutubeUrlService {

  constructor() { }

  /**
   * getVideoId
   */
  public static getVideoId(url: string): string | null {
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

  /**
   * getVideoEmbed
   */
  public static getVideoEmbed(url: string) {
    url = encodeURIComponent(url);
    return fetch(`https://www.youtube.com/oembed?url=${url}&format=json`, {
      method: 'GET',
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
  }

  /**
   * getVideoThumbnail
   */
  // public static async getVideoThumbnail(videoid: string) {
  //   const res: HTMLImageElement | void = await new Promise<HTMLImageElement>((resolve, reject) => {
  //     const img = new Image();
  //     img.onload = (event) => resolve(img);
  //     img.onerror = (event) => reject(event);
  //     img.src = `https://img.youtube.com/vi/${videoid}/default.jpg`;
  //   }).catch((e) => {
  //     console.log('onload error', e);
  //     return;
  //   });
  //   console.log(res);
  // }
}
