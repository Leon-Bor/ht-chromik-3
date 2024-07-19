import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  // https://aimlapi.com/app/keys
  protected apiKey = '414d98ae088547e4ad7a65f0c8aee436';
  protected model = 'meta-llama/Llama-2-7b-chat-hf';

  constructor(protected http: HttpClient) {}

  getMovieScene(movieTitle: string) {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    return this.http.post(
      'https://api.aimlapi.com/chat/completions',
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a movie nerd. I will show you a movie title and you have to tell me the most important movie scene in 3 sentences without naming the protagonists or the actors.',
          },
          { role: 'user', content: movieTitle },
        ],
        temperature: 0.7,
        max_tokens: 128,
      },
      {
        headers,
      }
    );
  }
}
