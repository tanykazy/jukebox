import { Injectable } from '@angular/core';


export const reYoutubeUrl: RegExp = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+$/;

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
      if (hostname.match(/^youtu\.be$/)) {
        return addr.pathname.slice(1);
      } if (hostname.match(/^((w){3}.)?youtube\.com$/)) {
        const searchParams: URLSearchParams = addr.searchParams;
        return searchParams.get('v');
      } else {
        return null;
      }
    } catch (error) {
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
}
