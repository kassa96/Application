from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class VideoResponse(BaseModel):
    id: int
    url: str | None = None
    youtube_video_id: str | None = None
    title: str | None = None
    topic: str | None = None
    category: str | None = None
    main_category: str | None = None
    language: str | None = None
    duration: str | None = None
    duration_posted: str | None = None
    rich_description: str | None = None
    view_count: int | None = 0
    like_count: int | None = 0
    print_count: int | None = 0
    logo_url: str | None = None
    published_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class InterviewerResponse(BaseModel):
    id: int
    name: Optional[str] = None
    expertise: Optional[List[str]] = None
    suggested_topic: Optional[List[str]] = None
    image_profil: Optional[str] = None
    activity: Optional[str] = None
    biography: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    tiktok: Optional[str] = None
    wikipedia: Optional[str] = None
    website: Optional[str] = None
    follower: Optional[bool] = None
    videos: Optional[List[VideoResponse]] = None
    model_config = ConfigDict(from_attributes=True)

class SingleVideoResponse(BaseModel):
    podcast_detail: VideoResponse
    interviewers: List[InterviewerResponse]
    similar_podcasts: List[VideoResponse]
    model_config = ConfigDict(from_attributes=True)

class VideoStatResponse(BaseModel):
    view_count: Optional[int] = None,
    like_count: Optional[int] = None,
    visited_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SingleInterviewerResponse(BaseModel):
    interviewer_detail: InterviewerResponse 
    hosted_podcasts: List[VideoResponse] = None,
    simular_interviewers: List[InterviewerResponse] = None
    model_config = ConfigDict(from_attributes=True)

