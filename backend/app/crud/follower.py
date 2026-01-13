from sqlalchemy import distinct, select
from sqlalchemy.orm import Session
from typing import List, Optional

from database.model import Follow


def get_followed_interviewers(db: Session, user_id: int) -> List[int]:
    """
    Return the unique list of interviewers followed by a user.

    :param db: Database session.
    :param user_id: ID of the user.
    :return: List of interviewer IDs followed by the user.
    """
    try:
        stmt = (
            select(distinct(Follow.interviewer_id))
            .where(Follow.user_id == user_id)
        )
        result = db.execute(stmt)
        interviewer_ids = result.scalars().all()
        return list(interviewer_ids)
    except Exception as e:
        print(f"Error in get_followed_interviewers: {e}")
        return []


def follow_exists(db: Session, user_id: int, interviewer_id: int) -> bool:
    """
    Check if a follow relationship exists between a user and an interviewer.

    :param db: Database session.
    :param user_id: ID of the user.
    :param interviewer_id: ID of the interviewer.
    :return: True if follow exists, False otherwise.
    """
    try:
        stmt = select(Follow).where(
            Follow.user_id == user_id,
            Follow.interviewer_id == interviewer_id
        )
        result = db.execute(stmt)
        follow = result.scalars().first()
        return follow is not None
    except Exception as e:
        print(f"Error in follow_exists: {e}")
        return False


def save_follow(db: Session, user_id: int, interviewer_id: int) -> Optional[Follow]:
    """
    Create a new follow relationship between a user and an interviewer.

    :param db: Database session.
    :param user_id: ID of the user.
    :param interviewer_id: ID of the interviewer.
    :return: Follow object if successful, None otherwise.
    """
    try:
        # Check if follow already exists
        if follow_exists(db, user_id, interviewer_id):
            print(f"Follow already exists: user {user_id} -> interviewer {interviewer_id}")
            return None
        
        follow = Follow(user_id=user_id, interviewer_id=interviewer_id)
        db.add(follow)
        db.commit()
        db.refresh(follow)
        return follow
    except Exception as e:
        db.rollback()
        print(f"Error in create_follow: {e}")
        return None


def delete_follow(db: Session, user_id: int, interviewer_id: int) -> bool:
    """
    Delete a follow relationship between a user and an interviewer.

    :param db: Database session.
    :param user_id: ID of the user.
    :param interviewer_id: ID of the interviewer.
    :return: True if deleted successfully, False otherwise.
    """
    try:
        stmt = select(Follow).where(
            Follow.user_id == user_id,
            Follow.interviewer_id == interviewer_id
        )
        result = db.execute(stmt)
        follow = result.scalars().first()
        
        if not follow:
            return False
        
        db.delete(follow)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error in delete_follow: {e}")
        return False


def get_user_follows(db: Session, user_id: int) -> List[Follow]:
    """
    Get all follow relationships for a specific user.

    :param db: Database session.
    :param user_id: ID of the user.
    :return: List of Follow objects.
    """
    try:
        stmt = select(Follow).where(Follow.user_id == user_id)
        result = db.execute(stmt)
        follows = result.scalars().all()
        return list(follows)
    except Exception as e:
        print(f"Error in get_user_follows: {e}")
        return []


def get_interviewer_followers(db: Session, interviewer_id: int) -> List[int]:
    """
    Get all user IDs following a specific interviewer.

    :param db: Database session.
    :param interviewer_id: ID of the interviewer.
    :return: List of user IDs following the interviewer.
    """
    try:
        stmt = select(Follow.user_id).where(Follow.interviewer_id == interviewer_id)
        result = db.execute(stmt)
        user_ids = result.scalars().all()
        return list(user_ids)
    except Exception as e:
        print(f"Error in get_interviewer_followers: {e}")
        return []


def get_followers_count(db: Session, interviewer_id: int) -> int:
    """
    Get the count of followers for a specific interviewer.

    :param db: Database session.
    :param interviewer_id: ID of the interviewer.
    :return: Number of followers.
    """
    try:
        stmt = select(Follow).where(Follow.interviewer_id == interviewer_id)
        result = db.execute(stmt)
        follows = result.scalars().all()
        return len(follows)
    except Exception as e:
        print(f"Error in get_followers_count: {e}")
        return 0


def get_following_count(db: Session, user_id: int) -> int:
    """
    Get the count of interviewers followed by a user.

    :param db: Database session.
    :param user_id: ID of the user.
    :return: Number of interviewers followed.
    """
    try:
        stmt = select(Follow).where(Follow.user_id == user_id)
        result = db.execute(stmt)
        follows = result.scalars().all()
        return len(follows)
    except Exception as e:
        print(f"Error in get_following_count: {e}")
        return 0