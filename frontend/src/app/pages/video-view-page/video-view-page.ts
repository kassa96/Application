import { Component, inject, signal, effect, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PodcastService } from '../../services/podcast-service';
import { marked } from 'marked';
import { DecimalPipe } from '@angular/common';
import { InterviewerCard } from '../../components/interviewer-card/interviewer-card';
import { InterviewerService } from '../../services/interviewer-service';
import { InterviewerEntity, VideoEntity } from '../../models/entity.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-video-view-page',
  standalone: true,
  imports: [DecimalPipe, NavbarComponent, InterviewerCard],
  templateUrl: './video-view-page.html',
  styleUrls: ['./video-view-page.css'],
})
export class VideoViewPage {
  // Injectez les services en premier
  private videoService = inject(PodcastService);
  private interviewerService = inject(InterviewerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  
  // Ensuite, utilisez-les pour initialiser les autres propriétés
  similarPodcasts = signal<VideoEntity[]>([]);
  interviewers = signal<InterviewerEntity[]>([]);
  sanitizedUrl = signal<SafeResourceUrl | null>(null);
  descriptionHtml = signal<any>(null);
  searchTerm = signal('');
  
  // Signaux de chargement pour afficher des skeletons/loaders
  loadingInterviewers = signal(false);
  loadingSimilar = signal(false);
  
  // Utilisez directement le signal du service
  singlePodcast = this.videoService.singlePodcast;
  
  private topic_id: string | null = null;
  private lastLoadedId: number | null = null;

  constructor() {
    // Observer les changements de route
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.topic_id = params.get('topic_id');
      if (this.topic_id) {
        // Réinitialiser immédiatement l'état
        this.resetState();
        
        // Charger le podcast (la page s'affichera dès que ces données arrivent)
        this.loadPodcast(this.topic_id);
      }
    });

    // Effect pour générer le HTML de la description
    effect(() => {
      const desc = this.singlePodcast()?.rich_description ?? '';
      if (desc) {
        this.descriptionHtml.set(
          this.sanitizer.bypassSecurityTrustHtml(marked.parse(desc, { async: false }))
        );
      }
    });

    // Effect pour charger les données secondaires en arrière-plan
    effect(() => {
      const video = this.singlePodcast();
      
      if (!video?.id || video.id === this.lastLoadedId) {
        return;
      }

      console.log("Podcast chargé, lancement des requêtes secondaires");
      this.lastLoadedId = video.id;

      // Lancer TOUTES les requêtes secondaires EN PARALLÈLE (pas de setTimeout)
      this.loadSecondaryData(video);
    });
  }

  /**
   * Réinitialise l'état du composant pour un nouveau podcast
   */
  private resetState(): void {
    this.interviewers.set([]);
    this.similarPodcasts.set([]);
    this.lastLoadedId = null;
    this.loadingInterviewers.set(false);
    this.loadingSimilar.set(false);
  }

  /**
   * Charge les données secondaires EN PARALLÈLE (non bloquant)
   */
  private loadSecondaryData(video: VideoEntity): void {
    // Requête 1 : Hosts/Interviewers (en arrière-plan)
    this.loadInterviewers(video.id);

    // Requête 2 : Podcasts similaires (en arrière-plan)
    if (video.main_category && video.category && video.language) {
      this.loadSimilarPodcasts(
        video.id,
        video.main_category,
        video.category,
        video.language
      );
    }

    // Requête 3 : Stats (silencieusement, ne bloque rien)
    this.updateStats(video.id);
  }

  /**
   * Charge les interviewers en arrière-plan
   */
  private loadInterviewers(videoId: number): void {
    this.loadingInterviewers.set(true);
    
    this.videoService.getHostsInPodcast(videoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: InterviewerEntity[]) => {
          this.interviewers.set(data);
          this.loadingInterviewers.set(false);
        },
        error: (err: Error) => {
          console.error('Erreur lors du chargement des hosts:', err);
          this.loadingInterviewers.set(false);
        }
      });
  }

  /**
   * Charge les podcasts similaires en arrière-plan
   */
  private loadSimilarPodcasts(
    videoId: number, 
    mainCategory: string, 
    category: string, 
    language: string
  ): void {
    this.loadingSimilar.set(true);
    
    this.videoService.getSimilarPodcasts(videoId, mainCategory, category, language)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: VideoEntity[]) => {
          this.similarPodcasts.set(data);
          this.loadingSimilar.set(false);
        },
        error: (err: Error) => {
          console.error('Erreur lors du chargement des podcasts similaires:', err);
          this.loadingSimilar.set(false);
        }
      });
  }

  onSearchChange(value: string) {
    const trimmed = value.trim();
    this.searchTerm.set(trimmed);

    if (trimmed.length === 0) {
      if (this.topic_id) {
        this.router.navigate(['/podcasts', this.topic_id]);
      } else {
        this.router.navigate(['/podcasts']);
      }
    } else {
      this.router.navigate(['/podcasts'], { 
        queryParams: { q: trimmed, topic_id: this.topic_id }
      });
    }
  }

  onSearchCleared() {
    this.searchTerm.set('');
    if (this.topic_id) {
      this.router.navigate(['/podcasts', this.topic_id]);
    } else {
      this.router.navigate(['/podcasts']);
    }
  }

  /**
   * Charge le podcast principal (bloquant pour le rendu)
   */
  private loadPodcast(topic_id: string) {
    const id = parseInt(topic_id.split("-").pop() ?? "");
    this.videoService.getPodcastById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          console.log("Podcast principal chargé, la page peut s'afficher");
        })
      )
      .subscribe();
  }

  /**
   * Met à jour les statistiques (silencieusement)
   */
  private updateStats(podcastId: number) {
    this.videoService.updatePodcastStat(podcastId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          const currentPodcast = this.singlePodcast();
          if (currentPodcast) {
            this.videoService.singlePodcast.set({
              ...currentPodcast,
              view_count: stats.view_count,
              like_count: stats.like_count
            });
          }
        },
        error: (err) => {
          console.log('Stats update failed silently');
        }
      });
  }

  getSanitizedYoutubeUrl(videoId: any): SafeResourceUrl {
    const rawUrl = `https://www.youtube.com/embed/${videoId}?rel=0&fs=1&autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  onFollowClick(interviewer: InterviewerEntity) {
    this.interviewerService.followInterviewer(interviewer.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Mettre à jour localement
          this.interviewers.update(list => 
            list.map(i => 
              i.id === interviewer.id 
                ? { ...i, follower: true, followers_count: (i.followers_count ?? 0) + 1 }
                : i
            )
          );
        },
        error: (err) => {
          console.error('Erreur lors du follow:', err);
        }
      });
  }
}