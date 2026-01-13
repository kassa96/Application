from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.orm import contains_eager
from sqlalchemy import and_,  select, func, and_, or_, literal
from database.model import Channel, Follow, Interviewer, InterviewerStats,  Video ,InterviewerVideoLink
from sqlalchemy.exc import SQLAlchemyError
import random

from sqlalchemy import and_, or_, func, literal, select
from sqlalchemy.orm import Session

def get_interviewers_with_filter(
    db: Session,
    current_user_id: int | None = None,
    by_expertise: str | None = None,
    by_location: str | None = None,
    by_language: str | None = None,
    order_by: str = "published_at",
    ascending: bool = False,
    offset: int = 0,
    limit: int = 10,
):
    # -------------------------------------------------
    # 1️⃣ Base conditions (SANS Video)
    # -------------------------------------------------
    conditions = [
        or_(
            Interviewer.linkedin.like("%|existed"),
            Interviewer.twitter.like("%|existed"),
            Interviewer.instagram.like("%|existed"),
            Interviewer.tiktok.like("%|existed"),
            Interviewer.youtube.like("%|existed"),
        )
    ]

    if by_expertise:
        conditions.append(Interviewer.expertise.ilike(f"%{by_expertise.strip()}%"))

    if by_location:
        conditions.append(Interviewer.location.ilike(f"%{by_location.strip()}%"))

    # -------------------------------------------------
    # 2️⃣ Mapping colonne de tri (SAFE)
    # -------------------------------------------------
    order_map = {
        "published_at": InterviewerStats.latest_published_at,
        "video_count": InterviewerStats.video_count,
        "view_count": InterviewerStats.total_views,
        "like_count": InterviewerStats.total_likes,
        "followers": InterviewerStats.folowers_count,
    }

    order_col = order_map.get(order_by, InterviewerStats.latest_published_at)

    # -------------------------------------------------
    # 3️⃣ Query principale (FAST)
    # -------------------------------------------------
    stmt = (
        select(
            Interviewer.id,
            Interviewer.name,
            Interviewer.activity,
            Interviewer.expertise,
            Interviewer.location,
            Interviewer.image_profil,
            Interviewer.linkedin,
            Interviewer.twitter,
            Interviewer.instagram,
            Interviewer.facebook,
            Interviewer.youtube,
            Interviewer.tiktok,
            Interviewer.wikipedia,
            Interviewer.website,
            Interviewer.suggested_topic,
            InterviewerStats.folowers_count,
            InterviewerStats.video_count,
            InterviewerStats.total_views,
            InterviewerStats.total_likes,
            InterviewerStats.latest_published_at,
        )
        .join(InterviewerStats, InterviewerStats.interviewer_id == Interviewer.id)
        .where(and_(*conditions))
    )

    # -------------------------------------------------
    # 4️⃣ Follower flag
    # -------------------------------------------------
    if current_user_id is not None:
        stmt = (
            stmt.add_columns(
                func.coalesce(Follow.user_id.isnot(None), False).label("follower")
            )
            .outerjoin(
                Follow,
                and_(
                    Follow.interviewer_id == Interviewer.id,
                    Follow.user_id == current_user_id,
                ),
            )
        )
    else:
        stmt = stmt.add_columns(literal(False).label("follower"))

    # -------------------------------------------------
    # 5️⃣ Ordering + Pagination
    # -------------------------------------------------
    order_expr = order_col.asc().nullslast() if ascending else order_col.desc().nullslast()
    stmt = stmt.order_by(order_expr).offset(offset).limit(limit)

    result = db.execute(stmt)
    interviewers = result.mappings().all()

    if not interviewers:
        return []

    # -------------------------------------------------
    # 6️⃣ Récupérer les 3 dernières vidéos par interviewer
    # -------------------------------------------------
    interviewer_ids = [row["id"] for row in interviewers]

    video_rank = func.row_number().over(
        partition_by=InterviewerVideoLink.interviewer_id,
        order_by=Video.published_at.desc(),
    ).label("rn")

    videos_subq = (
        select(
            Video.id,
            InterviewerVideoLink.interviewer_id,
            Video.title,
            Video.topic,
            Video.view_count,
            Video.like_count,
            Video.url,
            Video.logo_url,
            Video.published_at,
            Video.duration,
            video_rank,
        )
        .join(InterviewerVideoLink, Video.id == InterviewerVideoLink.video_id)
        .where(
            InterviewerVideoLink.interviewer_id.in_(interviewer_ids),
            Video.is_podcast.is_(True),
        )
        .subquery()
    )

    videos = (
        db.execute(
            select(videos_subq).where(videos_subq.c.rn <= 3)
        )
        .mappings()
        .all()
    )

    # -------------------------------------------------
    # 7️⃣ Mapping final JSON
    # -------------------------------------------------
    videos_by_interviewer: dict[int, list] = {}
    for v in videos:
        videos_by_interviewer.setdefault(v["interviewer_id"], []).append(dict(v))

    output = []
    for interviewer in interviewers:
        interviewer_dict = dict(interviewer)
        interviewer_dict["videos"] = videos_by_interviewer.get(interviewer["id"], [])
        output.append(interviewer_dict)

    return output

from sqlalchemy import and_, or_, func, literal, select
from sqlalchemy.orm import Session


def get_interviewers_by_keywords(
    db: Session,
    search: str,
    current_user_id: int | None = None,
    offset: int = 0,
    limit: int = 10,
):
    # -------------------------------------------------
    # 1️⃣ Parse keywords
    # -------------------------------------------------
    keywords = [kw.strip() for kw in search.split() if kw.strip()]
    if not keywords:
        return []

    search_conditions = []
    for kw in keywords:
        search_conditions.append(
            or_(
                Interviewer.name.ilike(f"{kw}%"),
                Interviewer.expertise.ilike(f"{kw}%"),
            )
        )

    # -------------------------------------------------
    # 2️⃣ Base conditions (NO video join)
    # -------------------------------------------------
    base_conditions = [
        or_(*search_conditions),
        or_(
            Interviewer.linkedin.like("%|existed"),
            Interviewer.twitter.like("%|existed"),
            Interviewer.instagram.like("%|existed"),
            Interviewer.tiktok.like("%|existed"),
            Interviewer.youtube.like("%|existed"),
        ),
    ]

    # -------------------------------------------------
    # 3️⃣ Main interviewer query (FAST)
    # -------------------------------------------------
    stmt = (
        select(
            Interviewer.id,
            Interviewer.name,
            Interviewer.activity,
            Interviewer.expertise,
            Interviewer.location,
            Interviewer.image_profil,
            Interviewer.linkedin,
            Interviewer.twitter,
            Interviewer.instagram,
            Interviewer.facebook,
            Interviewer.youtube,
            Interviewer.tiktok,
            Interviewer.wikipedia,
            Interviewer.website,
            Interviewer.suggested_topic,
        )
        .where(and_(*base_conditions))
        .offset(offset)
        .limit(limit)
    )

    # -------------------------------------------------
    # 4️⃣ Follow flag
    # -------------------------------------------------
    if current_user_id:
        stmt = (
            stmt.add_columns(
                func.coalesce(Follow.user_id.isnot(None), False).label("follower")
            )
            .outerjoin(
                Follow,
                and_(
                    Follow.interviewer_id == Interviewer.id,
                    Follow.user_id == current_user_id,
                ),
            )
        )
    else:
        stmt = stmt.add_columns(literal(False).label("follower"))

    interviewers = db.execute(stmt).mappings().all()
    if not interviewers:
        return []

    result = []
    for interviewer in interviewers:
        interviewer_dict = dict(interviewer)
        interviewer_dict["videos"] = []
        result.append(interviewer_dict)

    return result


def get_single_interviewer(
    db: Session, 
    id: int, 
    current_user_id: int = None
):
    """
    Récupère un interviewer par ID, et ajoute un champ 'follower' 
    indiquant si current_user_id le suit.
    Retourne toujours un dict.
    """
    try:
        stmt = select(Interviewer.id, 
                Interviewer.image_profil, 
                Interviewer.name, 
                Interviewer.activity,
                Interviewer.expertise,
                Interviewer.biography,
                Interviewer.suggested_topic,
                Interviewer.print_count
            ).where(Interviewer.id == id)
        
        #step4: check if current user has followed the podcast
        if current_user_id is not None:
            stmt = stmt.add_columns(
                func.coalesce(Follow.user_id.isnot(None), False).label("follower")
            )
            stmt = stmt.outerjoin(
                Follow,
                (Follow.interviewer_id == Interviewer.id)
                    & (Follow.user_id == current_user_id),
                )
        else:
            stmt = stmt.add_columns(literal(None).label("follower")
        )
        result = db.execute(stmt)
        interviewer = result.mappings().first()
        if not interviewer:
            return None
        return dict(interviewer)

    except Exception as e:
        print("error in function get_interviewer_by_id:", e)
        return None

def get_similar_interviewers(
    db: Session,
    interviewer_id: int,
    expertises: List[str],
    current_user_id: Optional[int] = None,
    limit: int = 10
) -> List[dict]:
    """
    Récupère des intervenants partageant les mêmes expertises que celui en paramètre.
    Inclut le champ calculé 'follower' si current_user_id est fourni.
    """
    if not expertises:
        return []

    # Construction des mots-clés à partir des deux premières expertises
    selected_expertises = expertises[:2]
    expertise_words = []
    for exp in selected_expertises:
        expertise_words.extend(exp.split())

    # Conditions pour la recherche
    conditions = [
        Interviewer.expertise.ilike(f"%{word}%") for word in expertise_words
    ]

    # Sélection des champs
    base_select = [
        Interviewer.id,
        Interviewer.name,
        Interviewer.expertise,
        Interviewer.image_profil,
        Interviewer.biography
    ]

    # Ajouter la colonne calculée follower si current_user_id est fourni
    if current_user_id is not None:
        base_select.append(
            func.coalesce(Follow.user_id.isnot(None), False).label("follower")
        )
        join_follow = (Follow.interviewer_id == Interviewer.id) & (Follow.user_id == current_user_id)
    else:
        base_select.append(literal(None).label("follower"))
        join_follow = None

    # Construction de la requête
    stmt = select(*base_select).join(
        InterviewerVideoLink, Interviewer.id == InterviewerVideoLink.interviewer_id
    )

    if current_user_id is not None:
        stmt = stmt.outerjoin(Follow, join_follow)

    stmt = stmt.where(
        Interviewer.id != interviewer_id,
        or_(*conditions),
        or_(
            Interviewer.linkedin.like("%|existed"),
            Interviewer.twitter.like("%|existed"),
            Interviewer.instagram.like("%|existed"),
            Interviewer.tiktok.like("%|existed"),
            Interviewer.youtube.like("%|existed"),
        )
    ).distinct().limit(limit)

    # Exécution et conversion en dict
    results = db.execute(stmt).mappings().all()
    if not results:
        return []

    interviewers = [dict(row) for row in results]
    random.shuffle(interviewers)

    # Retour selon la limite souhaitée
    return interviewers[:min(limit +20, len(interviewers))]


def get_interviewer_by_id(db: Session, id: int) -> Optional[Interviewer]:
    """
    Récupère un interviewer dont l'ID correspond à celui passé en paramètre.

    :param db: La session de base de données  utilisée pour exécuter la requête.
    :param id: L'identifiant de l'interviewer à récupérer.

    :return: Un objet Interviewer si trouvé, sinon None.
    """
    try:
        statement = select(Interviewer).where(Interviewer.id == id)
        result = db.execute(statement)
        interviewer = result.scalars().first()
        return interviewer
    except Exception as e:
        print("error in function get_interviewer_by_id:", e)
        return None

def get_podcasts_by_interviewer(
    db: Session,
    interviewer_id: int,
    offset: int = 0,
    limit: int = 20,
) -> Optional[List[Video]]:
    
    try:
        stmt = (
            select(Video.id,
                  Video.url,
                  Video.title,
                  Video.topic,
                  Video.duration,
                  Video.view_count,
                  Video.like_count,
                  Video.logo_url,
                  Video.published_at)
            .join(InterviewerVideoLink, InterviewerVideoLink.video_id == Video.id)
            .join(Channel, Channel.id == InterviewerVideoLink.channel_id)
            .where(InterviewerVideoLink.interviewer_id == interviewer_id,
                   Video.is_podcast.is_(True)
                   )
            .options(
                contains_eager(Video.interviewers_links)          
                .contains_eager(InterviewerVideoLink.channel)    
            )
            .offset(offset)
            .limit(limit)
        )

        result  = db.execute(stmt)
        videos: List[Video] = result.unique().scalars().all()  


        for v in videos:
            link = v.interviewers_links[0]  
            v.channel_name = link.channel.name
            v.channel_url  = link.channel.url
            v.channel_id = link.channel.id
            v.channel_logo = link.channel.logo_url

        return videos

    except Exception as e:
        db.rollback()
        print("error in get_podcasts_by_interviewer:", e)
        return None
def update_interviewer(db: Session, updated_interviewer: Interviewer) -> Optional[Interviewer]:
    """
    Met à jour un objet Interviewer existant avec uniquement les champs modifiés.
    
    :param db: Session de base de données.
    :param updated_interviewer: Objet Interviewer contenant l'ID et les champs à mettre à jour.
    :return: L'objet Interviewer mis à jour, ou None si non trouvé ou erreur.
    """
    try:
        if updated_interviewer.id is None:
            print("update_interviewer: Aucun ID fourni.")
            return None

        statement = select(Interviewer).where(Interviewer.id == updated_interviewer.id)
        result = db.execute(statement)
        existing_interviewer = result.scalars().first()

        if not existing_interviewer:
            print(f"Aucun interviewer trouvé avec l'ID {updated_interviewer.id}")
            return None

        # On parcourt les attributs de updated_interviewer et on met à jour uniquement ceux non None
        for field, value in vars(updated_interviewer).items():
            if field.startswith("_"):  # ignorer les attributs internes SQLAlchemy
                continue
            if value is not None:
                setattr(existing_interviewer, field, value)

        db.commit()
        db.refresh(existing_interviewer)
        return existing_interviewer

    except Exception as e:
        print("Erreur dans update_interviewer:", e)
        db.rollback()
        return None


def save_interviewer(db: Session, interviewer: Interviewer) -> Optional[Interviewer]:
    try:
        db.add(interviewer)
        db.commit()
        db.refresh(interviewer)
        return interviewer
    except Exception as e:
        db.rollback()
        print("Erreur dans create_interviewer:", e)
        return None
    
def save_follow(db: Session, user_id: int, interviewer_id: int) -> Optional[Follow]:
    follow = Follow(
        user_id=user_id,
        interviewer_id=interviewer_id,
        followed_at=datetime.utcnow() 
    )
    try:
        db.add(follow)
        db.commit()
        db.refresh(follow)
        return follow
    except SQLAlchemyError as e:
        db.rollback()
        print("Erreur dans save_follow:", e)
        return None
