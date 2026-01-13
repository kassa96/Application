from app.models.response_entity import InterviewerResponse, SingleVideoResponse, VideoResponse, VideoStatResponse
from fastapi import APIRouter, Depends, HTTPException
from app.crud.videos_repos import *
from app.session import get_session
from app.utils.entities import process_interviewer_dict, process_video_dict
from database.model import Video
from app.utils.youtube_api import update_stat_video
from datetime import datetime
from datetime import datetime, timedelta

REFRESH_INTERVAL_MINUTES = 30  

router = APIRouter()


@router.get("/search", response_model=list[VideoResponse])
def search_podcasts(query: str, offset: int = 0,limit: int = 10, session: Session= Depends(get_session)):
    podcasts = get_podcast_by_keywords(db = session, search=query)
    if not podcasts:
        return []
    return [
        VideoResponse.model_validate(process_video_dict(p))
        for p in podcasts
    ]

@router.get("/filter", response_model=list[VideoResponse])
def make_filter(
    by_main_category: str = None,
    by_sub_category: str = None,
    by_language: str = None,
    order_by: str = "published_at",
    ascending: bool = False,
    offset: int = 0,
    limit: int = 10,
    session: Session= Depends(get_session),

):
    if order_by not in ["video_count", "view_count", "like_count", "published_at"]:
        order_by = "published_at"
    podcasts = []
    podcasts = get_podcasts_with_filter(
                db = session,
                offset = offset,
                limit = limit,
                order_by  = order_by, 
                ascending = ascending,
                by_main_category=by_main_category,
                by_sub_category=by_sub_category,
                by_language=by_language)
    if not podcasts:
        return []
    return [
        VideoResponse.model_validate(process_video_dict(p))
        for p in podcasts
    ]
@router.get("/{podcast_id}", response_model=VideoResponse)
def get_podcast(
    podcast_id: int,
    session: Session= Depends(get_session),
):
    podcast_infos = get_single_podcast(db=session, video_id=podcast_id)
    if not podcast_infos:
        raise HTTPException(status_code=404, detail="Podcast not found")

    if podcast_infos["print_count"] is None:
        podcast_infos["print_count"] = 0
    podcast_infos["print_count"] += 1  
    update_video(session, Video(**podcast_infos))   
    processed_podcast_detail = VideoResponse.model_validate(process_video_dict(podcast_infos))
    return processed_podcast_detail
@router.get("/hosts/{podcast_id}", response_model=List[InterviewerResponse])
def get_host_in_podcast(
    podcast_id: int,
    session: Session= Depends(get_session),
):
    interviewers =  get_interviewers_by_podcast(db=session, video_id=podcast_id, current_user_id=None)
    if not interviewers:
        return []
    processed_guests = [InterviewerResponse.model_validate(process_interviewer_dict(interviewer)) for interviewer in interviewers]
    return processed_guests

@router.get("/similar_podcast/{podcast_id}", response_model=List[VideoResponse])
def get_podcast(
    podcast_id: int,
    main_category: str,
    sub_category: str,
    language: str,
    session: Session= Depends(get_session),
): 
    similar_podcasts = get_similar_podcasts(
        db=session,
        video_id=podcast_id,
        video_main_category=main_category,
        video_sub_category=sub_category,
        video_language=language,
        limit=10
    )
    processed_similar_podcasts = [ VideoResponse.model_validate(process_video_dict(podcast)) for podcast in similar_podcasts]
    return processed_similar_podcasts

@router.get("/{podcast_id}/update-stats", response_model=VideoStatResponse)
def update_podcast_stat(
    podcast_id: int,
    session: Session= Depends(get_session),
):
    """
    Met à jour les stats de ce podcast uniquement si la dernière mise à jour remonte à plus de X minutes.
    """
    existing_video = get_podcast_by_id(db=session, id=podcast_id)
    if not existing_video:
        raise HTTPException(status_code=404, detail="Podcast non trouvé")

    if existing_video.visited_at:
        time_diff = datetime.utcnow() - existing_video.visited_at
        if time_diff < timedelta(minutes=REFRESH_INTERVAL_MINUTES):
            return {
                "view_count": existing_video.view_count,
                "like_count": existing_video.like_count,
                "visited_at": existing_video.visited_at,
                "status": "cached"
            }

    video_stats, error = update_stat_video(existing_video.youtube_video_id)
    if error:
        raise HTTPException(status_code=400, detail=error)

    updated_video = Video(
        id=existing_video.id,
        view_count=int(video_stats["view_count"]),
        like_count=int(video_stats["like_count"]),
        visited_at=datetime.utcnow()
    )
    saved_video = update_video(session, updated_video)

    if not saved_video:
        raise HTTPException(status_code=500, detail="La mise à jour de la vidéo a échoué")
    return VideoStatResponse(view_count=saved_video.view_count, 
                             like_count =saved_video.like_count, 
                             visited_at=saved_video.visited_at)