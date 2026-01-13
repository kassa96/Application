import random
from typing import List, Optional
from sqlalchemy import and_, distinct, func, literal, or_
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import update

from app.utils.entities import process_video_dict
from database.model import  Follow, Interviewer, InterviewerVideoLink, Video

def save_video(session: Session, video: Video) -> Video | None:
    """
    Enregistre une vidéo dans la base de données et retourne l'objet vidéo avec son ID.
    
    :param session: Session de base de données .
    :param video: Instance du modèle Video à enregistrer.
    :return: L'objet Video avec son ID, ou None en cas d'erreur.
    """
    try:
        session.add(video)
        session.commit()
        session.refresh(video)  
        return video
    except Exception as e:
        session.rollback()
        print("Erreur dans create_video:", e)
        return None

def save_all_videos(db: Session, videos: list[Video]) -> list[Video] | None:
    """
    Sauvegarde une liste de vidéos dans la base de données et retourne les objets avec leurs IDs mis à jour.
    """
    try:
        db.add_all(videos)
        db.flush()  
        db.commit()
        return videos
    except Exception as e:
        db.rollback()
        print("❌ Erreur dans save_all_videos:", e)
        return None

def get_podcast_by_keywords(
    db: Session, 
    search: str, 
    limit: int = 20
):
    """
    Recherche des podcasts en fonction de mots-clés dans plusieurs colonnes.
    Retourne toujours une liste de dictionnaires.
    """

    try:
        # Construction des conditions
        conditions = []
        keywords = search.split()
        for keyword in keywords:
            conditions.append(Video.category.ilike(f"%{keyword}%"))
            conditions.append(Video.main_category.ilike(f"%{keyword}%"))
            #conditions.append(Video.title.ilike(f"%{keyword}%"))
            conditions.append(Video.topic.ilike(f"%{keyword}%"))


        # Base du SELECT
        base_select = [
                       Video.id,
                       Video.title,
                       Video.topic,
                       Video.rich_description,
                       Video.logo_url,
                       Video.duration,
                       Video.view_count,
                       Video.like_count,
                       Video.main_category,
                       Video.published_at
                       ]

        # Construction de la requête
        stmt = select(*base_select).where(Video.is_podcast.is_(True), or_(*conditions))
        stmt = stmt.order_by(Video.published_at.desc().nulls_last())

        stmt = stmt.limit(limit)
        result = db.execute(stmt)
        videos = result.mappings().all()
        return [
                {
                "id": video.id,
                 "title": video.title,
                 "main_category": video.main_category,
                 "topic": video.topic,
                 "duration": video.duration,
                 "rich_description": video.rich_description,
                 "view_count": video.view_count,
                 "like_count": video.like_count,
                 "logo_url": video.logo_url,
                 "published_at": video.published_at,
                }
                for video in videos
            ]

    except Exception as e:
        print("error in function get_videos_by_keywords:", e)
        return None

def update_video(db: Session, updated_video: Video) -> Optional[Video]:
    """
    Met à jour un objet Video existant avec uniquement les champs modifiés.

    :param db: Session de base de données.
    :param updated_video: Objet Video contenant l'ID et les champs à mettre à jour.
    :return: L'objet Video mis à jour, ou None si non trouvé ou erreur.
    """
    try:
        if updated_video.id is None:
            print("update_video: Aucun ID fourni.")
            return None

        statement = select(Video).where(Video.id == updated_video.id)
        result = db.execute(statement)
        existing_video = result.scalars().first()

        if not existing_video:
            print(f"Aucune vidéo trouvée avec l'ID {updated_video.id}")
            return None

        # Parcourt des attributs et mise à jour uniquement des champs non None
        for field, value in vars(updated_video).items():
            if field.startswith("_"):  # Ignorer les attributs internes SQLAlchemy
                continue
            if value is not None:
                setattr(existing_video, field, value)

        db.commit()
        db.refresh(existing_video)  # Retourne l'objet mis à jour depuis la base
        return existing_video

    except Exception as e:
        print("Erreur dans update_video:", e)
        db.rollback()
        return None


def filter_videos_by_ids(session: Session, video_ids: List[int]) -> (List[Video], List[int]): # type: ignore
    """
    Fonction pour récupérer les vidéos correspondant à une liste d'IDs et retourner les IDs manquants.
    
    :param session: La session SQLModel.
    :param video_ids: Liste des IDs de vidéos à filtrer.
    :return: Un tuple contenant une liste des vidéos trouvées et une liste des IDs manquants.
    """
    try:
        statement = select(Video).where(Video.video_id.in_(video_ids))        
        result = session.execute(statement)        
        videos = result.scalars().all()        
        found_video_ids = [video.video_id for video in videos]
        missing_ids = [video_id for video_id in video_ids if video_id not in found_video_ids]
        return videos, missing_ids
    except Exception as e:
        session.rollback() 
        print("erreur in function filter_videos_by_ids: ",e)
        return None, None

def get_podcasts_with_filter(
    db: Session,
    offset: int = 0,
    limit: int = 10,
    order_by: str = "published_at",   # "view_count", "like_count", "published_at", "duration"
    ascending: bool = False,
    by_main_category: str | None = None,
    by_sub_category: str | None = None,     
    by_language: str | None = None,
):
    """
    Retourne les podcasts (vidéos) filtrés et triés.
    """
    #step1: select videos wich are podcasts
    base_conditions = [
        Video.is_podcast.is_(True),
       
    ]
    # step2: apply filters
    if by_main_category:
        fv = by_main_category.strip()
        base_conditions.append(func.lower(Video.main_category) == fv.lower())

    if by_sub_category:
        fv = by_sub_category.strip()
        base_conditions.append(func.lower(Video.category) == fv.lower())
    if by_language:
        fv = by_language.strip()
        base_conditions.append(func.lower(Video.language) == fv.lower())
    # step3: make request
    stmt = (
        select(
               Video.id,
               Video.title, 
               Video.topic, 
               Video.view_count, 
               Video.like_count, 
               Video.url, 
               Video.logo_url, 
               Video.published_at, 
               Video.rich_description,
               Video.duration,
               Video.main_category
            )
        .join(InterviewerVideoLink, Video.id == InterviewerVideoLink.video_id)
        .join(Interviewer, Interviewer.id == InterviewerVideoLink.interviewer_id)
        .where(and_(*base_conditions))
    )
    # step4: apply orders
    if order_by == "view_count":
        col = Video.view_count
    elif order_by == "like_count":
        col = Video.like_count
    elif order_by == "duration":
        col = Video.duration
    else:  
        col = Video.published_at

    if ascending:
        stmt = stmt.order_by(col.asc().nulls_last())
    else:
        stmt = stmt.order_by(col.desc().nulls_last())

    stmt = stmt.offset(offset).limit(limit)

    result = db.execute(stmt)
    videos = result.mappings().all()
    videos_list = [
    {
        "id": v["id"],
        "title": v.get("title"),
        "topic": v.get("topic"),
        "main_category": v.get("main_category"),
        "view_count": v.get("view_count", 0),
        "like_count": v.get("like_count", 0),
        "url": v.get("url"),
        "logo_url": v.get("logo_url"),
        "published_at": v.get("published_at"),
        "rich_description": v.get("rich_description"),
        "duration": v.get("duration"),
    }
    for v in videos]
    return [process_video_dict(video) for video in videos_list]

def get_single_podcast(
    db: Session,
    video_id: int,
):
    """
    Retourne une vidéo podcast unique par son id,
    avec les intervenants liés et info follow (follower=True/False).
    """
    stmt_video = (
        select(Video.id,
               Video.title, 
               Video.topic, 
               Video.view_count, 
               Video.like_count, 
               Video.url, 
               Video.logo_url, 
               Video.published_at, 
               Video.rich_description,
               Video.print_count,
               Video.main_category,
               Video.category,
               Video.language,
               Video.youtube_video_id,
               Video.duration)
        .where(Video.id == video_id, Video.is_podcast.is_(True))
    )
    result_video = db.execute(stmt_video)
    video = result_video.mappings().first()

    if not video:
        return None
    return dict(video)
    

def get_interviewers_by_podcast(
    db: Session,
    video_id: int,
    current_user_id: Optional[int],
):
    """
    Retourne une vidéo podcast unique par son id,
    avec les intervenants liés et info follow (follower=True/False).
    """
    #step3: field of interviewer to select
    stmt = (
        select(Interviewer.id, 
               Interviewer.name, 
               Interviewer.expertise, 
               Interviewer.image_profil)
        .join(InterviewerVideoLink, Interviewer.id == InterviewerVideoLink.interviewer_id)
        .where(InterviewerVideoLink.video_id == video_id)
    )

    if current_user_id is not None:
        stmt = stmt.add_columns(
            func.coalesce(Follow.user_id.isnot(None), False).label("follower")
        ).outerjoin(Follow,(Follow.interviewer_id == Interviewer.id) & (Follow.user_id == current_user_id))
    else:
        stmt = stmt.add_columns(literal(None).label("follower"))
    stmt = stmt.where(InterviewerVideoLink.video_id == video_id)
    result_interviewers = db.execute(stmt)
    interviewer_rows = result_interviewers.mappings().all()
    if not interviewer_rows:
        return []
    return [dict(interviewer) for interviewer in interviewer_rows ]


def get_similar_podcasts(db: Session, video_id: int,video_main_category: str,video_sub_category: str, video_language: str, limit: int = 5):
    """
    Récupère les vidéos similaires basées sur la même catégorie que la vidéo donnée.
    """
    stmt = (
        select(Video.id,
               Video.title,
               Video.topic,
               Video.logo_url,
               Video.duration
               )
        .where(
            Video.category == video_sub_category,
            Video.is_podcast.is_(True),
            Video.id != video_id,
            Video.language == video_language  
        )
        .order_by(Video.published_at.desc().nulls_last())
        .limit(limit)
    )
    result = db.execute(stmt)
    videos = result.scalars().all()
    if len(videos) <= 0:
        stmt = (
        select(Video.id,
               Video.title,
               Video.topic,
               Video.logo_url,
               Video.duration)
        .where(
            Video.main_category == video_main_category,
            Video.is_podcast.is_(True),
            Video.id != video_id,
            Video.language == video_language  
        )
        .order_by(Video.published_at.desc().nulls_last())
        .limit(limit)
    )
    result = db.execute(stmt)
    videos = result.mappings().all()  
    videos = [
    {
        "id": v["id"],
        "title": v.get("title"),
        "topic": v.get("topic"),
        "logo_url": v.get("logo_url"),
        "duration": v.get("duration"),
    }
    for v in videos]
    videos_dict = [process_video_dict(video) for video in videos]
     
    random.shuffle(videos_dict)
    return videos_dict[:min(limit+20, len(videos_dict))]

def get_hosted_podcasts(db: Session, interviewer_id: int, limit: int = 5):
    stmt = (
        select(
            Video.id,
            Video.title,
            Video.topic,
            Video.logo_url,
            Video.url,
            Video.published_at,
            Video.duration,
            Video.view_count,
            Video.like_count,
        )
        .join(InterviewerVideoLink, Video.id == InterviewerVideoLink.video_id)
        .where(
            Video.is_podcast.is_(True),
            InterviewerVideoLink.interviewer_id == interviewer_id,
        )
        .order_by(Video.published_at.desc().nulls_last())
        .limit(limit)
    )

    rows = db.execute(stmt).mappings().all()

    return [dict(row) for row in rows]


def get_podcast_by_id(db: Session, id: str) -> Optional[Video]:
    """
    Récupère une vidéo depuis la base de données à partir de son  ID .
    """
    try:
        statement = select(Video).where(Video.id == id)
        result = db.execute(statement)
        return result.scalar_one_or_none()
    except Exception as e:
        db.rollback()
        print("Erreur dans get_podcast_by_id function:", e)
        return None


