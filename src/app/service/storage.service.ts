import { Injectable } from '@angular/core';

export const Storage = {
  Settings: 'SETTINGS',
  Playlist: 'PLAYLIST',
} as const;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  static getItem(keyName: string): any | null {
    if (storageAvailable('localStorage')) {
      const value = window.localStorage.getItem(keyName);
      if (value === null) {
        return value;
      }
      try {
        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    }
  }

  static setItem(keyName: string, keyValue: any): void {
    if (storageAvailable('localStorage')) {
      window.localStorage.setItem(keyName, JSON.stringify(keyValue));
    }
  }
}

/**
 * Detects whether localStorage is both supported and available.
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 * @param {'localStorage'|'sessionStorage'} type - Web Storage Type
 * @returns {boolean} Availability
 */
function storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean | undefined {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}