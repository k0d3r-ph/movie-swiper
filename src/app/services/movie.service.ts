import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { chaveAPI } from '../api-config';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiKey = chaveAPI.chave;
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  public getPopularMovies(page: number = 1) {
    const apiUrl = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=pt-BR&sort_by=popularity.desc&page=${page}`;
    return this.http.get(apiUrl);
  }
}
