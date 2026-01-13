import { differenceInDays, parseISO } from 'date-fns';
export interface ChannelModel {
  id: number;
  user_id?: number | null;
  name?: string | null;
  creator_name?: string | null;
  url?: string | null;
  youtube_channel_id?: string | null;
  description?: string | null;
  prev_subs_count?: number | null;
  prev_video_count?: number | null;
  prev_view_count?: number | null;
  subs_count?: number | null;
  video_count?: number | null;
  view_count?: number | null;
  created_at?: string | null; 
  visited_at?: string; 
  prev_date_visited?: string; 
  logo_url?: string | null;
  is_scrapping?: boolean | null;
  date_updated?: string | null; 
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  mail?: string | null;
  phone?: string | null;
  state?: number | null;
}
export class ChannelEntity implements ChannelModel {
  id!: number;
  user_id?: number | null;
  name?: string | null;
  creator_name?: string | null;
  url?: string | null;
  youtube_channel_id?: string | null;
  description?: string | null;
  prev_subs_count?: number | null;
  prev_video_count?: number | null;
  prev_view_count?: number | null;
  subs_count?: number | null;
  video_count?: number | null;
  view_count?: number | null;
  created_at?: string | null; 
  visited_at?: string; 
  prev_date_visited?: string; 
  logo_url?: string | null;
  is_scrapping?: boolean | null;
  date_updated?: string | null; 
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  mail?: string | null;
  phone?: string | null;
  state?: number | null;

  constructor(data: ChannelModel) {
    Object.assign(this, data);
  }

  getGrowth(field: 'subs' | 'videos' | 'views'): number {
    const current = this[`${field}_count` as keyof ChannelModel] as number | undefined;
    const prev = this[`prev_${field}_count` as keyof ChannelModel] as number | undefined;

    if (!prev || !current || prev === 0) return 0;
    const growth = ((current - prev) / prev) * 100;
    return Math.round(growth * 10) / 10;
  }

  getGrowthDuration(): { start?: string; end?: string; days?: number } {
    if (!this.visited_at || !this.prev_date_visited) return {};
    const start = parseISO(this.prev_date_visited);
    const end = parseISO(this.visited_at);
    const days = differenceInDays(end, start);
    return {
      start: this.prev_date_visited,
      end: this.visited_at,
      days,
    };
  }
}

