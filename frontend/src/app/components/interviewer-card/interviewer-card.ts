import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { InterviewerEntity } from '../../models/entity.model';
import { InterviewerService } from '../../services/interviewer-service';

@Component({
  selector: 'app-interviewer-card',
  imports: [],
  templateUrl: './interviewer-card.html',
  styleUrl: './interviewer-card.css'
})
export class InterviewerCard {
@Input() interviewer!: InterviewerEntity
private interviewerService = inject(InterviewerService);

onFollowClick() {
  this.interviewerService.followSingleInterviewer(this.interviewer.id).subscribe({
    next: () => {
      this.interviewer.follower = true;
      this.interviewer.followers_count = (this.interviewer.followers_count ?? 0) + 1;
    },
    error: err => {
      console.error('Erreur lors du follow:', err);
    }
  });
}

}
