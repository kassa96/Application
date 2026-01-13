import { afterNextRender, Component, computed, inject } from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Interviewer } from '../../components/interviewer/interviewer';
import { InterviewerService } from '../../services/interviewer-service';
import { ActionEvent, SortNav } from '../../components/sort-nav/sort-nav';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-ineterviewers-page',
  standalone: true,
  imports: [NavbarComponent, Interviewer, InfiniteScrollDirective, SortNav],
  templateUrl: './interviewers-page.html',
  styleUrls: ['./interviewers-page.css']
})
export class InterviewersPage {
  private currentFilters = {
    profession: '',
    language: '',
    category: '',
    subcategory: '',
    sort: '',
    location: '',
    keyword: ''
  };
  private currentOrders = {
    published_at: '',
    video_count: '',
    view_count: '',
    like_count: ''
  }

  interviewerService = inject(InterviewerService);

  interviewers = computed(() => this.interviewerService.interviewers());
  loading = computed(() => this.interviewerService.loading());
  error = computed(() => this.interviewerService.error());
  canLoadMore = computed(() => this.interviewerService.canLoadMore());
  private route = inject(ActivatedRoute);
  private router = inject(Router);

constructor() {
    this.route.queryParams.subscribe(params => {
      const keyword = params['q'] || '';
      const singleId = params['id']; // récupère l'ID transmis par SingleInterviewerPage

      if (keyword) {
        this.currentFilters.keyword = keyword;
        this.interviewerService.applyFilters(this.currentFilters);
      } else {
        this.resetFilters();
        this.interviewerService.applyFilters(this.currentFilters);

        // Si l'ID est présent → redirige vers la page single-interviewer correspondante
        if (singleId) {
          this.router.navigate(['/interviewers', singleId]);
        }
      }
    });

  }

onSearchCleared() {
  this.resetFilters();
  this.interviewerService.applyFilters(this.currentFilters);

  const username = this.route.snapshot.queryParams['username'];
  console.log("interviewer username:", username)
  if (username) {
    this.router.navigate(['/interviewers', username]);
  }
}


  onFollow(interviewerId: number) {
    this.interviewerService.followInterviewer(interviewerId).subscribe();
  }

onSearchChange(search: string) {
  this.resetFilters();
  this.currentFilters.keyword = search
  const username = this.route.snapshot.queryParams['username'];
  if (username && search.length == 0) {
    this.router.navigate(['/interviewers', username]);
  }
  this.interviewerService.applyFilters(this.currentFilters)
}


  onActionReceived(event: ActionEvent): void {
    console.log("etem selected::", event.type, event.value)
    switch (event.type) {
      case 'suggestion':
        console.log('For You clicked - Show personalized content');
        this.resetFilters();
        this.interviewerService.applyFilters(this.currentFilters);
        break;
      case 'expertise':
        console.log('expertise selected:', event.value);
        this.resetFilters();
        this.currentFilters.profession = event.value ?? '';
        this.interviewerService.applyFilters(this.currentFilters);
        break;
      case 'language':
        console.log('language selected:', event.value);
        this.resetFilters();
        this.currentFilters.language = event.value ?? '';
        this.interviewerService.applyFilters(this.currentFilters);
        break;
      case 'location':
        console.log('location selected:', event.value);
        this.resetFilters();
        this.currentFilters.location = event.value ?? '';
        this.interviewerService.applyFilters(this.currentFilters);
        break;
        
      case 'sort':
        console.log('Sort changed:', event.value);
        if (event.value){
          let parts = event.value.split("|")
          if (parts.length == 2){
            let order_by = parts[0]
            let ascending = parts[1]
            this.resetorders()
            if (order_by == "published_at"){
              this.currentOrders.published_at = ascending
            }
            if (order_by == "video_count"){
              this.currentOrders.video_count = ascending
            }
            if (order_by == "view_count"){
              this.currentOrders.view_count = ascending
            }
            if (order_by == "like_count"){
              this.currentOrders.like_count = ascending
            }
            this.interviewerService.applyOrders(this.currentOrders)
          }
        }
        break;
    }
  }

  resetFilters(): void {
    this.currentFilters = {
      keyword: '',
      language: '',
      location: '',
      profession: '',
      category: '',
      subcategory: '',
      sort: 'date-newest'
    };
  }
  resetorders(): void{
    this.currentOrders={
      published_at: '',
      video_count: '',
      view_count: '',
      like_count: ''
    }
  }
}
