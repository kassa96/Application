import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://127.0.0.1:8000';
  mainCategories = signal<string[]>([]);
  expertises = signal<string[]>([]);
  languages = signal<string[]>([]);
  locations = signal<string[]>([]);
  subCategories = signal<string[]>([]);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  private prependNoChoice(list: string[]): string[] {
    const clean = (list || []).filter(item => item !== "no choice");
    return clean;
  }

  loadMainCategories(): Observable<string[]> {
    const url = `${this.baseUrl}/categories/main`;
    return this.http.get<string[]>(url).pipe(
      tap(categories => this.mainCategories.set(this.prependNoChoice(categories))),
      catchError(err => {
        console.error('Error loading main categories:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.mainCategories.set(["no choice"]);
        return of([] as string[]);
      })
    );
  }

  loadLocations(): Observable<string[]> {
    const url = `${this.baseUrl}/categories/locations`;
    return this.http.get<string[]>(url).pipe(
      tap(locations => this.locations.set(this.prependNoChoice(locations))),
      catchError(err => {
        console.error('Error loading locations:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.mainCategories.set(["no choice"]);
        return of([] as string[]);
      })
    );
  }

  loadSubCategories(mainCategory?: string): Observable<string[]> {
    let url = `${this.baseUrl}/categories/sub`;
    if (mainCategory) {
      url += `?main_category=${encodeURIComponent(mainCategory)}`;
    }
    return this.http.get<string[]>(url).pipe(
      tap(subCategories => this.subCategories.set(this.prependNoChoice(subCategories))),
      catchError(err => {
        console.error('Error loading sub categories:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.subCategories.set(["no choice"]);
        return of([] as string[]);
      })
    );
  }

  loadExpertises(): Observable<string[]> {
    const url = `${this.baseUrl}/categories/expertises`;
    return this.http.get<string[]>(url).pipe(
      tap(expertises => this.expertises.set(this.prependNoChoice(expertises))),
      catchError(err => {
        console.error('Error loading expertises:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.expertises.set(["no choice"]);
        return of([] as string[]);
      })
    );
  }

  loadLanguages(): Observable<string[]> {
    const url = `${this.baseUrl}/categories/languages`;
    return this.http.get<string[]>(url).pipe(
      tap(languages => this.languages.set(this.prependNoChoice(languages))),
      catchError(err => {
        console.error('Error loading languages:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.languages.set(["no choice"]);
        return of([] as string[]);
      })
    );
  }
}
