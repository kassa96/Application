import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { InterviewersPage } from './pages/interviewers-page/interviewers-page';
import { ChannelDatailPage } from './pages/channel-datail-page/channel-datail-page';
import { PodcastsPage } from './pages/podcasts-page/podcasts-page';
import { VideoViewPage } from './pages/video-view-page/video-view-page';
import { SingleInterviewerPage } from './pages/single-interviewer-page/single-interviewer-page';
export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  {
    path: 'interviewers',
    component: InterviewersPage,
  },
  {
    path: 'interviewers/:username',
    component: SingleInterviewerPage,
  },
  {
    path: "channels/one",
    component: ChannelDatailPage
  },
  {
    path: 'podcasts',
    component: PodcastsPage,
  },
  {
    path: 'podcasts/:topic_id',
    component: VideoViewPage,
  },
  
];