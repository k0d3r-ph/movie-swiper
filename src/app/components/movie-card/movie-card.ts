import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HammerModule } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule, HammerModule],
  standalone: true,
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCard implements OnInit {
  private movieService = inject(MovieService);
  private paginaAtual = signal(1);
  public feedbackAtivo = signal<'like' | 'nope' | null>(null);

  public deckDeFilmes = signal<any[]>([]);
  public cardPan = signal({ x: 0, rotation: 0 });

  constructor() {}

  buscarMaisFilmes() {
    const pagina = this.paginaAtual();

    this.movieService
      .getPopularMovies(pagina)
      .pipe(
        map((resposta: any) => resposta.results),
        catchError((error) => {
          console.error('ERRO AO BUSCAR FILMES (Página ' + pagina + '):', error);
          return of([]);
        })
      )
      .subscribe((novosFilmes) => {
        this.deckDeFilmes.update((deckAtual) => {
          return [...novosFilmes, ...deckAtual];
        });

        this.paginaAtual.update((p) => p + 1);
      });
  }

  ngOnInit(): void {
    this.buscarMaisFilmes();
  }

  getTransform(index: number): string {
    const totalCards = this.deckDeFilmes().length;

    if (index === totalCards - 1) {
      const pan = this.cardPan();
      return `translateX(${pan.x}px) rotate(${pan.rotation}deg)`;
    }

    const scale = 1 - (totalCards - 1 - index) * 0.05;
    const translateY = (totalCards - 1 - index) * 10;

    return `scale(${scale}) translateY(${translateY}px)`;
  }

  onPanMove(event: any) {
    const x = event.deltaX;
    const rotation = x * 0.03;

    this.cardPan.set({ x, rotation });

    const limiteFeedback = 50;

    if (x > limiteFeedback) {
      this.feedbackAtivo.set('like');
    } else if (x < -limiteFeedback) {
      this.feedbackAtivo.set('nope');
    } else {
      this.feedbackAtivo.set(null);
    }
  }

  onPanEnd(event: any) {
    const x = event.deltaX;
    this.feedbackAtivo.set(null);

    if (Math.abs(x) > 150) {
      const xFinal = x > 0 ? 1000 : -1000;
      this.cardPan.set({ x: xFinal, rotation: this.cardPan().rotation });

      setTimeout(() => {
        this.deckDeFilmes.update((deck) => deck.slice(0, -1));
        this.cardPan.set({ x: 0, rotation: 0 });

        if (this.deckDeFilmes().length <= 5) {
          this.buscarMaisFilmes();
        }
      }, 300);
    } else {
      this.cardPan.set({ x: 0, rotation: 0 });
    }
  }

  getZIndex(index: number): number {
    return index;
  }

  dispararSwipe(foiLike: boolean) {
    const direcao = foiLike ? 1 : -1;
    const xFinal = direcao * 1000;

    this.cardPan.set({ x: xFinal, rotation: direcao * 15 });

    setTimeout(() => {
      this.deckDeFilmes.update((deck) => deck.slice(0, -1));

      this.cardPan.set({ x: 0, rotation: 0 });

      if (this.deckDeFilmes().length <= 5) {
        this.buscarMaisFilmes();
      }
    }, 300);
  }
}
