import videojs from 'video.js';
import { Player } from 'video.js';

declare module 'video.js' {
  interface Player {
    markers: {
      (options: any): void;
      reset(markers: any[]): void;
      add: (markers: any[]) => void;
      remove: (indexArray: number[]) => void;
      removeAll: () => void;
      destroy: () => void;
    };
  }
}

declare module 'videojs-markers-plugin'; 