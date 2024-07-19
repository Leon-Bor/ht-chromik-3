import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { generate } from 'random-words';

@Injectable({
  providedIn: 'root',
})
export class OmdbService {
  protected apiKey = '3e306b3b';
  protected type = 'movie';

  constructor(protected http: HttpClient) {}

  getMovies() {
    console.log('getMovies');
    return this.http.get(
      `https://www.omdbapi.com/?s=${this.getRandomWord()}&apikey=${
        this.apiKey
      }&type=${this.type}&plot=short&r=json`
    );
  }

  protected getRandomWord() {
    return generate({ minLength: 5, maxLength: 10 });
  }

  getMovieDetails(imdbID: string) {
    return this.http.get(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${this.apiKey}&plot=short&r=json`
    );
  }
}
