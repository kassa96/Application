import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InterviewerEntity } from '../../models/entity.model';
import { CommonModule} from '@angular/common';

@Component({
  selector: 'app-interviewer',
  imports: [CommonModule],
  templateUrl: './interviewer.html',
  styleUrl: './interviewer.css'
})
export class Interviewer {
@Input() interviewer!: InterviewerEntity
@Output() follow = new EventEmitter<number>();

onFollowClick() {
  this.follow.emit(this.interviewer.id);  
}

ngOnInit() {
  if (!this.interviewer.videos){
    return
  }
  this.interviewer.currentVideo = this.interviewer.videos[0];
}
goToProfile(username: string | null) {
  window.location.href = `/interviewers/${username}`;
}
 
isFirstVideo(): boolean {
  if (!this.interviewer.videos){
    return false
  }
  return this.interviewer.videos[0]?.id === this.interviewer.currentVideo?.id;
}

isLastVideo(): boolean {
  if (!this.interviewer.videos){
    return false
  }
  return this.interviewer.videos[this.interviewer.videos.length - 1]?.id === this.interviewer.currentVideo?.id;
}


prevVideo(interviewerId: number) {
  if (!this.interviewer.videos){
    return
  }
  const idx = this.interviewer.videos.findIndex(v => v.id === this.interviewer.currentVideo.id);
  if (idx > 0) {
    this.interviewer.currentVideo = this.interviewer.videos[idx - 1];
  }
}

nextVideo(interviewerId: number) {
  if (!this.interviewer.videos){
    return
  }
  const idx = this.interviewer.videos.findIndex(v => v.id === this.interviewer.currentVideo.id);
  if (idx < this.interviewer.videos.length - 1) {
    this.interviewer.currentVideo = this.interviewer.videos[idx + 1];
  }
}

}
