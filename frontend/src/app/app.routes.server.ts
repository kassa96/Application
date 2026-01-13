import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'interviewers',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'interviewers/:username',
    renderMode: RenderMode.Server   
  },
  {
    path: 'channels/one',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'podcasts',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'podcasts/:topic_id',
    renderMode: RenderMode.Server   
  }
];
