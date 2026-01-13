from app.models.response_entity import InterviewerResponse, SingleInterviewerResponse, VideoResponse
from fastapi import APIRouter, Depends, HTTPException
from app.crud.follower import follow_exists
from app.crud.videos_repos import get_hosted_podcasts
from app.session import get_session
from app.utils.entities import process_interviewer_dict, process_video_dict
from database.model import Interviewer
from app.crud.interviewers_repos import *

router = APIRouter()

@router.get("/filter", response_model=list[InterviewerResponse])
def make_filters(
    by_expertise: str = None,
    by_location: str = None,
    by_language: str = None,
    order_by: str = "published_at",
    ascending: bool = False,
    offset: int = 0,
    limit: int = 10,
    session: Session = Depends(get_session),

):
    if order_by not in ["video_count", "view_count", "like_count", "published_at", "language"]:
        order_by = "published_at"
    interviewers = []
    interviewers = get_interviewers_with_filter(
                        db = session,
                        current_user_id = None,
                        offset = offset,
                        limit = limit,
                        order_by  = order_by, 
                        ascending = ascending,
                        by_expertise = by_expertise,
                        by_language = by_language,
                        by_location = by_location
                    )
    if not interviewers:
        return []
    for (i, interviewer) in enumerate(interviewers):
        processed_interviewer = InterviewerResponse.model_validate(process_interviewer_dict(interviewer))
        processed_videos = [ VideoResponse.model_validate(process_video_dict(video)) for video in interviewer["videos"]]
        processed_interviewer.videos = processed_videos
        interviewers[i] = processed_interviewer 
    return interviewers

@router.get("/search", response_model=list[InterviewerResponse])
def search_interviewers(query: str, session: Session = Depends(get_session)):
    if not query:
        return [] 
    interviewers = get_interviewers_by_keywords(db = session, search=query)
    if not interviewers:
        return []
    for (i, interviewer) in enumerate(interviewers):
        processed_interviewer = InterviewerResponse.model_validate(process_interviewer_dict(interviewer))
        processed_videos = [ VideoResponse.model_validate(process_video_dict(video)) for video in interviewer["videos"]]
        processed_interviewer.videos = processed_videos
        interviewers[i] = processed_interviewer 
    return interviewers

@router.get("/{id}", response_model=InterviewerResponse)
def get_interviewer(id: int, session: Session = Depends(get_session)):
    try:
        interviewer = get_single_interviewer(session, id)
        if interviewer is None:
            raise HTTPException(status_code=404, detail="Interviewer not found")
        new_print_count = (interviewer.get("print_count") or 0) + 1

        session.query(Interviewer).filter(
            Interviewer.id == interviewer["id"]
        ).update(
            {"print_count": new_print_count}
        )
        session.commit()
        interviewer_dict = process_interviewer_dict(interviewer)
        return interviewer_dict
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error : {str(e)}")

@router.get("/similar_interviewers/{interviewer_id}", response_model=List[InterviewerResponse])
def get_interviewer(interviewer_id: int, expertises: str, session: Session = Depends(get_session)):
    try:
        similar_interviewers = get_similar_interviewers(
            db=session,
            interviewer_id=interviewer_id,
            expertises=expertises.split("|")
        )
        if not similar_interviewers:
            return []
        simular_interviewers_res = [
            InterviewerResponse.model_validate(process_interviewer_dict(i))
            for i in similar_interviewers
        ]
        return simular_interviewers_res

    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error : {str(e)}")


@router.get("/hosted_podcast/{id}", response_model=List[VideoResponse])
def get_hosted_podcast_from_interviewer(id: int, session: Session = Depends(get_session)):
    try:
        hosted_podcasts = get_hosted_podcasts(session, id, 5)
        if not hosted_podcasts:
            return []
        hosted_podcasts_res = [
            VideoResponse.model_validate(process_video_dict(p))
            for p in hosted_podcasts
        ]
        return hosted_podcasts_res
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error : {str(e)}")


@router.get("/follow/{interviewer_id}")
def follow_interviewer(
    interviewer_id: int,
    session: Session = Depends(get_session)
):  
    if not interviewer_id or interviewer_id < 1:
        raise HTTPException(
            status_code=400,
            detail="This interviewer ID is not correct."
        )

    interviewer = get_interviewer_by_id(session, interviewer_id)
    if not interviewer:
        raise HTTPException(
            status_code=404,
            detail="This interviewer does not exist."
        )

    current_user_id = 1

    exist = follow_exists(session, current_user_id, interviewer_id)  
    if exist:
        raise HTTPException(
            status_code=404,
            detail="You are already following this interviewer."
        )

    follow = save_follow(session, user_id=current_user_id, interviewer_id=interviewer_id)
    if not follow:
        raise HTTPException(
            status_code=500,
            detail="Could not follow the interviewer."
        )

    interviewer.folowers_count = (interviewer.folowers_count or 0) + 1
    update_interviewer(session, interviewer)

    return {"message": f"You are now following {interviewer.name}."}