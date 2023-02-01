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
   * getVideoUrl
   */
  public static getVideoUrl(videoid: string): URL {
    const url = new URL('https://www.youtube.com');
    url.pathname = 'watch';
    url.searchParams.set('v', videoid);
    return url;
  }

  /**
   * getVideoEmbed
   */
  public static getVideoEmbed(url: string): Promise<OEmbedResponseTypeVideo> {
    url = encodeURIComponent(url);
    const param = `url=${url}&format=json`;
    return fetch(`https://www.youtube.com/oembed?${param}`, {
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

export interface OEmbedResponse {
  type: 'photo' | 'video' | 'link' | 'rich';
  version: '1.0';
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export interface OEmbedResponseTypeVideo extends OEmbedResponse {
  html: string;
  width: number;
  height: number;
}