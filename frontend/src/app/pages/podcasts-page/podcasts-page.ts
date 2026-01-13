import { Component, computed, inject } from '@angular/core';
import { PodcastList } from '../../components/podcast-list/podcast-list';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ActionEvent, SortNav } from '../../components/sort-nav/sort-nav';
import { PodcastService } from '../../services/podcast-service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-podcasts-page',
  imports: [NavbarComponent,   PodcastList, InfiniteScrollDirective, SortNav],
  templateUrl: './podcasts-page.html',
  styleUrl: './podcasts-page.css'
})
export class PodcastsPage {
  private readonly defaultFilters = {
    language: '',
    category: '',
    subcategory: '',
    sort: 'published_at|desc',
    keyword: ''
  };

  private readonly defaultOrders = {
    published_at: '',
    video_count: '',
    view_count: '',
    like_count: ''
  };

  private currentFilters = { ...this.defaultFilters };
  private currentOrders = { ...this.defaultOrders };

  podcastService = inject(PodcastService);

  videos = computed(() => this.podcastService.podcasts());
  loading = computed(() => this.podcastService.loading());
  error = computed(() => this.podcastService.error());
  canLoadMore = computed(() => this.podcastService.canLoadMore());
  searchQuery: string = '';
  private route = inject(ActivatedRoute);
  private router = inject(Router);


constructor() {
    this.route.queryParams.subscribe(params => {
      const keyword = params['q'] || '';
      const topic_id = params['topic_id']; 

      if (keyword) {
        this.currentFilters.keyword = keyword;
        this.podcastService.applyFilters(this.currentFilters);
      } else {
        this.resetFilters();
        this.podcastService.applyFilters(this.currentFilters);

        // Si l'ID est présent → redirige vers la page single-interviewer correspondante
        if (topic_id) {
          this.router.navigate(['/podcasts', topic_id]);
        }
      }
    });
  }

onSearchCleared() {
  this.resetFilters();
  this.podcastService.applyFilters(this.currentFilters);

  const topic_id = this.route.snapshot.queryParams['topic_id'];
  console.log("podcast topic_id:", topic_id)
  if (topic_id) {
    this.router.navigate(['/podcasts', topic_id]);
  }
}

onSearchChange(search: string) {
  this.resetFilters();
  this.currentFilters.keyword = search
  const topic_id = this.route.snapshot.queryParams['topic_id'];
  console.log("podcast id:", topic_id)
  if (topic_id && search.length == 0) {
    this.router.navigate(['/podcasts', topic_id]);
  }
  this.podcastService.applyFilters(this.currentFilters)
}


  onActionReceived(event: ActionEvent): void {
    switch (event.type) {
      case 'suggestion':
        this.resetFilters();
        break;

      case 'language':
        this.resetFilters()
        this.currentFilters.language = event.value ?? '';
        break;

      case 'category':
        this.resetFilters()
        this.currentFilters.category = event.value ?? '';
        this.currentFilters.subcategory = '';
        break;

      case 'subcategory':
        this.currentFilters.subcategory = event.value ?? '';
        break;

      case 'sort':
        if (event.value) {
          const [orderBy, ascending] = event.value.split('|');
          if (orderBy && ascending) {
            this.resetOrders();
            this.currentOrders[orderBy as keyof typeof this.currentOrders] = ascending;
            this.podcastService.applyOrders(this.currentOrders);
          }
        }
        return;
    }

    this.podcastService.applyFilters(this.currentFilters);
  }

  private resetFilters(): void {
    this.currentFilters = { ...this.defaultFilters };
  }

  private resetOrders(): void {
    this.currentOrders = { ...this.defaultOrders };
  }
}
