import { Injectable, signal } from '@angular/core';
import { InterviewerEntity, VideoEntity, PodcastStats } from '../models/entity.model';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PodcastService {
  private website = 'http://127.0.0.1:8000';
  private baseUrl = 'http://127.0.0.1:8000/podcasts';
  private offset = 0;
  private limit = 10;

  private filters = {
    language: '',
    category: '',
    subcategory: '',
    keyword: ''

  };

  private orders = {
    published_at: '',
    video_count: '',
    view_count: '',
    like_count: ''
  };

  singlePodcast = signal<VideoEntity | null>(null);
  guests = signal<InterviewerEntity[]>([]);
  similarPodcasts = signal<VideoEntity[]>([]);
  podcasts = signal<VideoEntity[]>([]);
  loading = signal(false);
  canLoadMore = signal(true);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadMore();
  }
  private getInitials(fullname: string): string {
    return fullname
      .split(/\s+/)
      .filter(word => word)
      .map(word => word[0].toUpperCase())
      .join('');

  }
    private getUsername(fullname: string, id: number): string {
    fullname = fullname.toLowerCase()
    .normalize('NFD')                     
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9]+/g, '-')          
    .replaceAll(/-+/g, '-')                  
    .replaceAll(/^-|-$/g, ''); 
    return fullname.replaceAll(" ", "-")+ '-'+id;
  }
   private getTopicId(topic: string, id: number): string {
    topic = topic.toLowerCase()
    .normalize('NFD')                     
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9]+/g, '-')          
    .replaceAll(/-+/g, '-')                  
    .replaceAll(/^-|-$/g, ''); 
    return topic.replaceAll(" ", "-")+ '-'+id;
  }

  private convertOrder(order: string) {
    if (order === "asc") return "true";
    if (order === "desc") return "false";
    return "";
  }

  private buildUrl(): string {
    let params = new URLSearchParams({
      offset: this.offset.toString(),
      limit: this.limit.toString(),
    });

    const { published_at, video_count, view_count, like_count } = this.orders;

    if (this.convertOrder(published_at)) {
      params.set("order_by", "published_at");
      params.set("ascending", this.convertOrder(published_at));
    } else if (this.convertOrder(video_count)) {
      params.set("order_by", "video_count");
      params.set("ascending", this.convertOrder(video_count));
    } else if (this.convertOrder(view_count)) {
      params.set("order_by", "view_count");
      params.set("ascending", this.convertOrder(view_count));
    } else if (this.convertOrder(like_count)) {
      params.set("order_by", "like_count");
      params.set("ascending", this.convertOrder(like_count));
    }

    const { category, subcategory, language, keyword } = this.filters;
    if (keyword){
      params.set("query", keyword)
      return `${this.baseUrl}/search?${params.toString()}`;
    }
    let url = ""
    if (!category && !subcategory && !language){
      url = `${this.baseUrl}/filter?${params.toString()}`;
      return url;
    }
    if (category) {
      params.set("by_main_category", category);
    }
    if (subcategory) {
      params.set("by_sub_category", subcategory);
    }
    if (language) {
      params.set("by_language", language);
    }
    url = `${this.baseUrl}/filter?${params.toString()}`;
    return url;
  }

  loadMore(): void {
    if (this.loading() || !this.canLoadMore()) return;

    this.loading.set(true);
    const url = this.buildUrl();

    this.http.get<VideoEntity[]>(url).pipe(
      tap(newPodcasts => {
        newPodcasts = newPodcasts.map((podcast) => {
          return {
          ...podcast,
          topic_id: this.getTopicId(podcast.topic, podcast.id),
        };
});

        this.podcasts.update(existing => {
          const merged = [...existing, ...newPodcasts];
          return merged.filter(
            (item, index, self) =>
              index === self.findIndex(i => i.id === item.id)
          );
        });

        this.offset += this.limit;
        this.canLoadMore.set(newPodcasts.length === this.limit);
        this.error.set(null);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error loading podcast:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.loading.set(false);
        return of([]);
      })
    ).subscribe();
  }

  applyFilters(filters: typeof this.filters) {
    this.filters = filters;
    this.offset = 0;
    this.canLoadMore.set(true);
    this.podcasts.set([]);
    this.loadMore();
  }

  applyOrders(orders: typeof this.orders) {
    this.orders = orders;
    this.offset = 0;
    this.canLoadMore.set(true);
    this.podcasts.set([]);
    this.loadMore();
  }

getPodcastById(id: number) {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<VideoEntity|null>(url).pipe(
      tap(data => {
        if (data){
          data["topic_id"] = this.getTopicId(data["topic"], data["id"])
        }
        this.singlePodcast.set(data ?? null);
        this.error.set(null);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error loading podcast:', err);
        this.error.set(err.message ?? 'Unknown error');
        return of({});
      })
    );
  }

getSimilarPodcasts(podcast_id: any, main_category: any, sub_category: any, language: any): Observable<VideoEntity[]> {
  const url = `${this.baseUrl}/similar_podcast/${podcast_id}?main_category=${main_category}&sub_category=${sub_category}&language=${language}`; 
  return this.http.get<VideoEntity[]>(url).pipe(
    tap(data => {
      this.similarPodcasts.set(data.map((podcast) => {
        podcast.topic_id = this.getTopicId(podcast.topic, parseInt(podcast.id.toString()));
        return podcast;
      }) ?? []);
      this.error.set(null);
      this.loading.set(false);
    }),
    catchError(err => {
      console.error('Error loading podcast:', err);
      this.error.set(err.message ?? 'Unknown error');
      return of([]); 
    })
  );
}

getHostsInPodcast(podcast_id: any): Observable<InterviewerEntity[]> {
  const url = `${this.baseUrl}/hosts/${podcast_id}`; 
  return this.http.get<InterviewerEntity[]>(url).pipe(
    tap(data => {
      this.guests.set(data.map((interviewer) => {
        interviewer.initials = this.getInitials(interviewer.name)
         interviewer.username = this.getUsername(interviewer.name, interviewer.id)
        return interviewer;
      }) ?? []);
      this.error.set(null);
      this.loading.set(false);
    }),
    catchError(err => {
      console.error('Error loading podcast:', err);
      this.error.set(err.message ?? 'Unknown error');
      return of([]); 
    })
  );
}

updatePodcastStat(id: number): Observable<PodcastStats> {
  const url = `${this.baseUrl}/${id}/update-stats`;
  return this.http.get<PodcastStats>(url).pipe(
    catchError(err => {
      console.error('Error updating podcast stats:', err);
      return of({ view_count: 0, like_count: 0 });
    })
  );
}


  followHostedInterviewer(interviewerId: number): Observable<any> {
      const url = `${this.website}/interviewers/follow/${interviewerId}`;
      return this.http.get(url).pipe(
        tap(() => {
          this.guests.update(interviewers =>
            interviewers.map(i =>
              i.id === interviewerId
                ? {
                    ...i,
                    follower: true,
                    followers_count: (i.followers_count ?? 0) + 1
                  }
                : i
            )
          );
        })
      );
    }
  
}
