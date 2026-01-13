import { Component, inject, signal, effect, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewerService } from '../../services/interviewer-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { marked } from 'marked';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DecimalPipe } from '@angular/common';
import { InterviewerCard } from '../../components/interviewer-card/interviewer-card';
import { InterviewerEntity, VideoEntity } from '../../models/entity.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-single-interviewer-page',
  standalone: true,
  imports: [NavbarComponent, DecimalPipe, InterviewerCard],
  templateUrl: './single-interviewer-page.html',
  styleUrls: ['./single-interviewer-page.css'],
})
export class SingleInterviewerPage {
  // Injections
  private interviewerService = inject(InterviewerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  // Signaux
  interviewer = this.interviewerService.interviewerDetail;
  hostedPodcasts = signal<VideoEntity[]>([]);
  similarInterviewers = signal<InterviewerEntity[]>([]);
  searchTerm = signal('');
  sanitizedUrl = signal<SafeResourceUrl | null>(null);
  biographyHtml = signal<any>(null);
  
  // Signaux de chargement
  loadingPodcasts = signal(false);
  loadingSimilar = signal(false);
  
  // État privé
  private currentInterviewerUsername: string | null = null;
  private lastLoadedId: number | null = null;

  constructor() {
    // Observer les changements de route
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.currentInterviewerUsername = params.get("username");
      if (this.currentInterviewerUsername) {
        // Réinitialiser l'état
        this.resetState();
        
        // Charger l'interviewer principal
        this.loadInterviewer(this.currentInterviewerUsername);
      }
    });

    // Effect pour générer le HTML de la biographie
    effect(() => {
      const bio = this.interviewer()?.biography ?? '';
      if (bio) {
        this.biographyHtml.set(
          this.sanitizer.bypassSecurityTrustHtml(marked.parse(bio, { async: false }))
        );
      }
    });

    // Effect pour charger les données secondaires
    effect(() => {
      const interviewer = this.interviewer();
      
      // Guard : éviter les rechargements inutiles
      if (!interviewer?.id || interviewer.id === this.lastLoadedId) {
        return;
      }

      console.log("Interviewer chargé, lancement des requêtes secondaires");
      this.lastLoadedId = interviewer.id;

      // Charger les données secondaires en parallèle
      this.loadSecondaryData(interviewer);
    });
  }

  /**
   * Réinitialise l'état du composant
   */
  private resetState(): void {
    this.hostedPodcasts.set([]);
    this.similarInterviewers.set([]);
    this.lastLoadedId = null;
    this.loadingPodcasts.set(false);
    this.loadingSimilar.set(false);
  }

  /**
   * Charge les données secondaires EN PARALLÈLE
   */
  private loadSecondaryData(interviewer: InterviewerEntity): void {
    // Requête 1 : Podcasts hébergés
    this.loadHostedPodcasts(interviewer.id);

    // Requête 2 : Interviewers similaires
    if (interviewer.expertise && interviewer.expertise.length > 0) {
      const expertises = interviewer.expertise.join("|");
      this.loadSimilarInterviewers(interviewer.id, expertises);
    }
  }

  /**
   * Charge les podcasts hébergés
   */
  private loadHostedPodcasts(interviewerId: number): void {
    this.loadingPodcasts.set(true);
    
    this.interviewerService.getHostedPodcast(interviewerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: VideoEntity[]) => {
          this.hostedPodcasts.set(data);
          this.loadingPodcasts.set(false);
        },
        error: (err: Error) => {
          console.error('Erreur lors du chargement des podcasts:', err);
          this.loadingPodcasts.set(false);
        }
      });
  }

  /**
   * Charge les interviewers similaires
   */
  private loadSimilarInterviewers(interviewerId: number, expertises: string): void {
    this.loadingSimilar.set(true);
    
    this.interviewerService.getSimilarInterviewres(interviewerId, expertises)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: InterviewerEntity[]) => {
          this.similarInterviewers.set(data);
          this.loadingSimilar.set(false);
        },
        error: (err: Error) => {
          console.error('Erreur lors du chargement des interviewers similaires:', err);
          this.loadingSimilar.set(false);
        }
      });
  }

  /**
   * Gère les changements de recherche
   */
  onSearchChange(value: string): void {
    const trimmed = value.trim();
    this.searchTerm.set(trimmed);

    if (trimmed.length === 0) {
      // Si champ vide, redirige vers single-interviewer
      if (this.currentInterviewerUsername) {
        this.router.navigate(['/single-interviewer', this.currentInterviewerUsername]);
      } else {
        this.router.navigate(['/interviewers']);
      }
    } else {
      // Recherche → transmet aussi l'ID de l'interviewer courant
      this.router.navigate(['/interviewers'], { 
        queryParams: { q: trimmed, username: this.currentInterviewerUsername }
      });
    }
  }

  /**
   * Efface la recherche
   */
  onSearchCleared(): void {
    this.searchTerm.set('');
    if (this.currentInterviewerUsername) {
      this.router.navigate(['/single-interviewer', this.currentInterviewerUsername]);
    } else {
      this.router.navigate(['/interviewers']);
    }
  }

  /**
   * Charge l'interviewer principal
   */
  private loadInterviewer(username: string): void {
    const id = parseInt(username.split("-").pop() ?? "");
    if (id) {
      this.interviewerService.getInterviewerById(id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            console.log("Interviewer principal chargé");
          })
        )
        .subscribe();
    }
  }

  /**
   * Gère le clic sur le bouton Follow
   */
  onFollowClick(): void {
    const current = this.interviewer();
    if (!current) return;

    this.interviewerService.followSingleInterviewer(current.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Follow réussi');
        },
        error: (err) => {
          console.error('Erreur lors du follow:', err);
        }
      });
  }
}