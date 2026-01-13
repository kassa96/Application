import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements AfterViewInit {
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchCleared = new EventEmitter<void>();

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Référence directe à l’input pour le focus
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  // Signal qui garde la valeur du champ
  searchTerm = signal('');

  constructor() {
    // Sync avec le paramètre ?q= de l’URL
    effect(() => {
      this.route.queryParams.subscribe(params => {
        const q = params['q'] || '';
        this.searchTerm.set(q);
        // Focus sur l’input si sur /interviewers
        if (this.router.url.startsWith('/interviewers') || this.router.url.startsWith('/podcasts')) {
          setTimeout(() => this.focusSearchInput(), 100);
        }
      });
    });
  }

  ngAfterViewInit() {
    if (this.router.url.startsWith('/interviewers')) {
      setTimeout(() => this.focusSearchInput(), 200);
    }
  }

  get searchTermValue() {
    return this.searchTerm();
  }
  set searchTermValue(value: string) {
    this.searchTerm.set(value);
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.searchChange.emit(value);
  }

  onClearSearch() {
    this.searchTerm.set('');

    const url = this.router.url;

    if (url.startsWith('/interviewers') || url.startsWith('/podcasts')) {
      // Vérifie si c'est une page single /interviewers/:id
      const singleMatch = url.match(/^\/(interviewers|podcasts)\/(\d+)/);

      if (singleMatch) {
        // Single page → on reste ici
        this.searchCleared.emit();
      } else {
        // /interviewers → rester sur la page
        this.searchCleared.emit();
      }
    } else {
      // Autres pages → on efface juste
      this.searchCleared.emit();
    }

    // Re-focus sur l'input
    this.focusSearchInput();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  private focusSearchInput() {
    if (this.searchInputRef?.nativeElement) {
      this.searchInputRef.nativeElement.focus();
    }
  }
}
