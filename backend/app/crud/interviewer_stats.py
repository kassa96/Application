
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.session import get_session_direct
from database.model import InterviewerStats, InterviewerVideoLink, Video


def rebuild_interviewer_stats(db: Session):
    stmt = (
        select(
            InterviewerVideoLink.interviewer_id.label("interviewer_id"),
            func.count(Video.id).label("video_count"),
            func.coalesce(func.sum(Video.view_count), 0).label("total_views"),
            func.coalesce(func.sum(Video.like_count), 0).label("total_likes"),
            func.max(Video.published_at).label("latest_published_at"),
        )
        .join(Video, Video.id == InterviewerVideoLink.video_id)
        .where(Video.is_podcast.is_(True))
        .group_by(InterviewerVideoLink.interviewer_id)
    )

    results = db.execute(stmt).all()

    # 🔥 Strategy : DELETE + INSERT (plus simple et sûr)
    db.query(InterviewerStats).delete()

    db.bulk_insert_mappings(
        InterviewerStats,
        [
            {
                "interviewer_id": r.interviewer_id,
                "video_count": r.video_count,
                "total_views": r.total_views,
                "total_likes": r.total_likes,
                "latest_published_at": r.latest_published_at,
            }
            for r in results
        ],
    )

    db.commit()
rebuild_interviewer_stats(get_session_direct())
