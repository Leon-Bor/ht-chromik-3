import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AiService } from './ai.service';
import { OmdbService } from './omdb.service';
import { SoundService } from './sound.service';

export interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Plot: string;
}

export enum QuizStatus {
  Loading = 'loading',
  Thinking = 'thinking',
  Answered = 'answered',
  Correct = 'correct',
  Incorrect = 'incorrect',
  Finished = 'finished',
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [OmdbService, AiService, SoundService],
})
export class AppComponent {
  title = 'hackathon-chromik-3';

  movies: Movie[] = [];
  rightAnswer: number = 0;
  movieDetails: any;
  hintLevel: number = 0;

  quizStatus = new BehaviorSubject<QuizStatus>(QuizStatus.Loading);

  choosenAnswer: number | undefined;

  score = 0;

  constructor(
    protected omdbService: OmdbService,
    protected aiService: AiService,
    protected soundService: SoundService
  ) {
    this.getNextQuestion();
  }

  getNextQuestion() {
    this.quizStatus.next(QuizStatus.Loading);
    this.soundService.playSound('waiting');
    this.omdbService.getMovies().subscribe((data: any) => {
      // this.movies = data;

      let movies: Movie[] = (data.Search as Movie[]).filter(
        (movie) => movie.Poster !== 'N/A'
      );

      if (movies.length >= 4) {
        movies = this.shuffle(movies);
        this.movies = movies.slice(0, 4);
      } else {
        this.getNextQuestion();
        return;
      }

      this.rightAnswer = this.getRandomNumberBetween(0, 3);

      // ? Would need a better API key with more requests
      // this.aiService
      //   .getMovieScene(this.movies[this.rightAnswer].Title)
      //   .subscribe((data: any) => {
      //     console.log(data);
      //   });

      this.omdbService
        .getMovieDetails(this.movies[this.rightAnswer].imdbID)
        .subscribe((data: any) => {
          this.movieDetails = data;
          if (this.movieDetails.Plot === 'N/A') {
            this.resetAnswer();
          }
          this.quizStatus.next(QuizStatus.Thinking);
          console.log(data);
        });

      console.log(this.movies);
    });
  }

  shuffle(array: any[]): any[] {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }

  getRandomNumberBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  chooseAnswer(index: number) {
    this.soundService.playSound('click');
    if (this.choosenAnswer !== undefined && this.choosenAnswer === index) {
      this.choosenAnswer = undefined;
      this.quizStatus.next(QuizStatus.Thinking);

      return;
    }
    this.choosenAnswer = index;
    this.quizStatus.next(QuizStatus.Answered);
  }

  submitAnswer() {
    console.log('Answer: ', this.choosenAnswer, this.rightAnswer);
    if (this.choosenAnswer === this.rightAnswer) {
      this.quizStatus.next(QuizStatus.Correct);
      this.soundService.playCorrect();
    } else {
      this.quizStatus.next(QuizStatus.Incorrect);
      this.soundService.playSound('incorrect-0');
    }

    setTimeout(() => {
      if (this.quizStatus.value === QuizStatus.Incorrect) {
        this.setHighScore();
        this.quizStatus.next(QuizStatus.Finished);
      } else {
        this.addScore();
        this.resetAnswer();
      }
    }, 3000);
  }

  resetAnswer() {
    this.choosenAnswer = undefined;
    this.movieDetails = undefined;
    this.movies = [];
    this.hintLevel = 0;
    this.getNextQuestion();
  }

  increaseHintLevel() {
    this.soundService.playSound('hint');
    if (this.hintLevel < 2) {
      this.hintLevel++;
    }
  }

  addScore() {
    this.score += 20;
    this.score = this.score - this.hintLevel * 5;
  }

  setHighScore() {
    const highscore = localStorage.getItem('highscore');

    if (!highscore) {
      localStorage.setItem('highscore', this.score.toString());
    } else {
      if (this.score > parseInt(highscore)) {
        this.soundService.playSound('highscore');
        localStorage.setItem('highscore', this.score.toString());
      } else {
        this.soundService.playSound('loose');
      }
    }
  }

  getHighscore() {
    return localStorage.getItem('highscore');
  }

  tryAgain() {
    this.soundService.playSound('click');
    this.score = 0;
    this.resetAnswer();
  }
}
