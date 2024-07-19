import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  constructor() {}

  playSound(name: string, volume: number = 1) {
    let audio = new Audio();
    audio.src = `https://leon-bor.github.io/ht-chromik-3/assets/audio/${name}.wav`;
    audio.load();
    audio.volume = volume;
    audio.play();
  }

  playCorrect() {
    this.playSound(`correct-${this.getRandomNumberBetween(0, 2)}`);
  }

  protected getRandomNumberBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
