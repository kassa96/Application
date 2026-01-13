import { Component, Input, computed, inject, afterNextRender, signal, PLATFORM_ID, ElementRef } from '@angular/core';
import { VideoEntity } from '../../models/entity.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { PodcastService } from '../../services/podcast-service';

@Component({
  selector: 'app-podcast-list',
  imports: [CommonModule],
  templateUrl: './podcast-list.html',
  styleUrl: './podcast-list.css'
})
export class PodcastList {
  @Input() video!: VideoEntity;

  private sanitizer = inject(DomSanitizer);
  private podcastService = inject(PodcastService);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

  private statsUpdated = signal(false);

  // Utiliser un signal au lieu de computed pour éviter les problèmes d'hydration
  descriptionHtml = signal<SafeHtml>('');

  constructor() {
    // Initialiser la description après le rendu pour éviter l'hydration mismatch
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initializeDescription();
        
        if (this.video?.id && !this.statsUpdated()) {
          this.observeVisibility();
        }
      }
    });
  }

  private initializeDescription() {
    const desc = this.video?.rich_description ?? '';
    
    if (!desc.trim()) {
      this.descriptionHtml.set(this.sanitizer.bypassSecurityTrustHtml('<p>No description available</p>'));
      return;
    }

    try {
      const rawHtml = marked.parse(desc, { 
        async: false,
        breaks: true,
        gfm: true
      });
      
      this.descriptionHtml.set(this.sanitizer.bypassSecurityTrustHtml(rawHtml));
      
    } catch (error) {
      console.error('Erreur lors du parsing du markdown:', error);
      this.descriptionHtml.set(
        this.sanitizer.bypassSecurityTrustHtml(
          `<p>${desc.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
        )
      );
    }
  }

  private observeVisibility() {
    setTimeout(() => {
      const element = this.elementRef.nativeElement.querySelector('[data-video-id]');
      
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.statsUpdated()) {
              this.updateStats();
              observer.disconnect();
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: '0px'
        }
      );

      observer.observe(element);
    }, 100);
  }

  private updateStats() {
    if (!this.video?.id || this.statsUpdated()) return;

    this.statsUpdated.set(true);

    this.podcastService.updatePodcastStat(this.video.id).subscribe({
      next: (stats) => {
        if (this.video) {
          this.video.view_count = stats.view_count;
          this.video.like_count = stats.like_count;
        }
        console.log(`Stats updated for video ${this.video.id}`);
      },
      error: (err) => {
        console.log('Stats update failed silently for video', this.video.id);
        this.statsUpdated.set(false);
      }
    });
  }
}