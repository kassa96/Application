export interface VideoEntity {
  id: number;
  url: string;
  youtube_video_id: string;
  title: string;
  language: string;
  key_words: string;
  category: string;
  main_category: string;
  topic: string;
  topic_id: string ;
  duration: string;
  description: string;
  rich_description: string;
  view_count: number;
  like_count: number;
  logo_url: string;
  published_at: string; 
  duration_posted: string; 
  channel_id: number;
  similar_videos: VideoEntity[];
  interviewers : InterviewerEntity[] ;
}

export interface InterviewerEntity {
  id: number;
  name: string;
  activity: string;
  username: string | null;
  initials: string | null;
  expertise: string[];
  biography: string | null;
  language: string;
  image_profil: string | null;
  location: string | null;
  nationality: string | null;
  country: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  wikipedia: string | null;
  website: string | null;
  mail: string | null;
  phone: string | null;
  suggested_topic: string[];
  followers_count: number;
  video_count: number;
  is_hoster: boolean;
  follower: boolean;
  videos: VideoEntity[] | null;
  currentVideo: VideoEntity;
}


export interface PodcastStats {
  view_count: number;
  like_count: number;
  visited_at?: string;
  status?: string;
}

