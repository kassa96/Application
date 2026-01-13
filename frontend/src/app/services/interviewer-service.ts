// src/app/services/interviewer.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InterviewerEntity, VideoEntity } from '../models/entity.model';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InterviewerService {
  private baseUrl = 'http://127.0.0.1:8000/interviewers';
  private offset = 0;
  private limit = 10;

  private filters = {
    profession: '',
    language: '',
    category: '',
    subcategory: '',
    location: '',
    keyword: ''
  };

  private orders = {
    published_at: '',
    video_count: '',
    view_count: '',
    like_count: ''
  }

  interviewers = signal<InterviewerEntity[]>([]);
  interviewerDetail = signal<InterviewerEntity | null>(null);
  podcastsList = signal<VideoEntity[]>([]);
  hostedPodcasts = signal<VideoEntity[]>([]);
  simularInterviewers = signal<InterviewerEntity[]>([]);


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
    console.log("topic::", topic)
    return topic.replaceAll(" ", "-")+ '-'+id;
  }

  private convertOrder(order: string){
    if (order == "asc"){
      return "true"
    } else if (order == "desc"){
      return "false"
    }
    else {
      return ""
    }
  }
  private buildUrl(): string {
    let params = new URLSearchParams({
      offset: this.offset.toString(),
      limit: this.limit.toString(),
    });
    const {published_at, video_count, view_count, like_count} = this.orders
    if (this.convertOrder(published_at)){
      params = new URLSearchParams({
      order_by: "published_at",
      ascending: this.convertOrder(published_at),
      offset: this.offset.toString(),
      limit: this.limit.toString(),
    });
    }else if (this.convertOrder(video_count)){
      params = new URLSearchParams({
      order_by: "video_count",
      ascending: this.convertOrder(video_count),
      offset: this.offset.toString(),
      limit: this.limit.toString(),
    });
    }else if (this.convertOrder(view_count)){
      params = new URLSearchParams({
      order_by: "view_count",
      ascending: this.convertOrder(view_count),
      offset: this.offset.toString(),
      limit: this.limit.toString(),
    });

    }else if (this.convertOrder(like_count)){
      params = new URLSearchParams({
      order_by: "like_count",
      ascending: this.convertOrder(like_count),
      offset: this.offset.toString(),
      limit: this.limit.toString(),
    });
    }
    const {language, profession, location, keyword} = this.filters;
    let url = ""
    if (!language && !profession && !location && !keyword){
      url = `${this.baseUrl}/all?${params.toString()}`;
    }
    if (keyword){
      params.set("query", keyword)
      return `${this.baseUrl}/search?${params.toString()}`;
    }
    if (language) {
      params.set("by_language", language);
    }
    if (profession) {
      params.set("by_expertise", profession);
    }
    if (location) {
      params.set("by_location", location);
    }
    url = `${this.baseUrl}/filter?${params.toString()}`;
    return url;
  }

  loadMore(): void {
    if (this.loading() || !this.canLoadMore()) return;

    this.loading.set(true);
    const url = this.buildUrl();

    this.http.get<InterviewerEntity[]>(url).pipe(
      tap(newInterviewers => {
        const enrichedInterviewers = newInterviewers.map(interviewer => ({
          ...interviewer,
          initials: this.getInitials(interviewer.name),
          username: this.getUsername(interviewer.name, interviewer.id)
        }));

        this.interviewers.update(existing => {
          const merged = [...existing, ...enrichedInterviewers];
          return merged.filter(
            (item, index, self) =>
              index === self.findIndex(i => i.id === item.id)
          );
        });

        this.offset += this.limit;
        this.canLoadMore.set(enrichedInterviewers.length === this.limit);
        this.error.set(null);
        this.loading.set(false);
      }),
      catchError(err => {
        console.log("error:", err)
        console.error('Error loading interviewers:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.loading.set(false);
        return of([] as InterviewerEntity[]);
      })
    ).subscribe();
  }

    getInterviewerById(id: number) {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<InterviewerEntity>(url).pipe(
      tap(data => {
        if (data){
          data["initials"] = this.getInitials(data["name"])
          data["username"] = this.getUsername(data["name"], data["id"])
        }
        this.interviewerDetail.set(data ?? null);
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

getHostedPodcast(id: number): Observable<VideoEntity[]> {
  const url = `${this.baseUrl}/hosted_podcast/${id}`; 
  return this.http.get<VideoEntity[]>(url).pipe(
    tap(data => {
      this.hostedPodcasts.set(data.map((podcast) => {
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

getSimilarInterviewres(interviewer_id: any, expertises: any): Observable<InterviewerEntity[]> {
  const url = `${this.baseUrl}/similar_interviewers/${interviewer_id}?expertises= ${expertises}`; 
  return this.http.get<InterviewerEntity[]>(url).pipe(
    tap(data => {
      this.simularInterviewers.set(data.map((interviewer) => {
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
  
  applyFilters(filters: { profession: string; language: string; category: string; subcategory: string; location: string, keyword: string }) {
    this.filters = filters;
    this.offset = 0;
    this.canLoadMore.set(true);
    this.interviewers.set([]);
    this.loadMore();
  }

  applyOrders(orders: {published_at: string, video_count: string; view_count: string, like_count: string}){
    this.orders = orders;
    this.offset = 0;
    this.canLoadMore.set(true);
    this.interviewers.set([]);
    this.loadMore();
  }

  loadAllPodcasts(interviewerId: string): Observable<VideoEntity[]> {
    this.loading.set(true);
    const url = `${this.baseUrl}/interviewers/${interviewerId}/podcasts`;

    return this.http.get<VideoEntity[]>(url).pipe(
      tap(() => this.error.set(null)),
      catchError(err => {
        console.error('Error loading podcasts:', err);
        this.error.set(err.message ?? 'Unknown error');
        this.loading.set(false);
        this.podcastsList.set([]);
        return of([]);
      }),
      map(podcasts => {
        this.loading.set(false);
        this.podcastsList.set(podcasts ?? []);
        return podcasts ?? [];
      })
    );
  }

  followInterviewer(interviewerId: number): Observable<any> {
    const url = `${this.baseUrl}/follow/${interviewerId}`;
    return this.http.get(url).pipe(
      tap(() => {
        this.interviewers.update(interviewers =>
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


followSingleInterviewer(interviewerId: number): Observable<any> {
  const url = `${this.baseUrl}/follow/${interviewerId}`;
  return this.http.get(url).pipe(
    tap(() => {
      this.interviewerDetail.update(current => {
        if (!current) return current;  
        return {
          ...current,
          follower: true,
          followers_count: (current.followers_count ?? 0) + 1
        };
      });
    })
  );
}

}
