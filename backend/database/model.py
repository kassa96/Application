from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    BigInteger,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# ─────────────────────────────────────────────
# Association tables
# ─────────────────────────────────────────────

class Suggestion(Base):
    __tablename__ = "suggestion"

    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    category_id = Column(Integer, ForeignKey("category.id"), primary_key=True)
    __table_args__ = (
        Index("ix_ivn_user_id", "user_id"),
        Index("ix_ivn_category_id", "category_id"),
    )



class Follow(Base):
    __tablename__ = "follow"

    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    interviewer_id = Column(Integer, ForeignKey("interviewer.id"), primary_key=True)
    followed_at = Column(DateTime, nullable=True)
    __table_args__ = (
        Index("ix_ivm_user_id", "user_id"),
        Index("ix_ivm_iinterviewer_id", "interviewer_id"),
    )



class InterviewerVideoLink(Base):
    __tablename__ = "interviewervideolink"

    video_id = Column(Integer, ForeignKey("video.id"), primary_key=True)
    interviewer_id = Column(Integer, ForeignKey("interviewer.id"), primary_key=True)

    __table_args__ = (
        Index("ix_ivl_video_id", "video_id"),
        Index("ix_ivl_interviewer_id", "interviewer_id"),
    )


# ─────────────────────────────────────────────
# Reference tables
# ─────────────────────────────────────────────

class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True, index=True)


class Expertise(Base):
    __tablename__ = "expertise"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True, index=True)


class Language(Base):
    __tablename__ = "language"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True, index=True)


# ─────────────────────────────────────────────
# User
# ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    channel = relationship("Channel", back_populates="user", uselist=False)
    interviewer = relationship("Interviewer", back_populates="user", uselist=False)

    following = relationship(
        "Interviewer",
        secondary="follow",
        back_populates="followers",
    )


# ─────────────────────────────────────────────
# Channel
# ─────────────────────────────────────────────

class Channel(Base):
    __tablename__ = "channel"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, index=True, nullable=True)

    name = Column(String, unique=True, index=True, nullable=True)
    creator_name = Column(String, nullable=True)
    biography = Column(Text)
    playlist = Column(String)
    youtube_channel_id = Column(String, unique=True, index=True, nullable=True)
    description = Column(Text)

    prev_subs_count = Column(BigInteger)
    prev_video_count = Column(BigInteger)
    prev_view_count = Column(BigInteger)

    subs_count = Column(BigInteger)
    video_count = Column(BigInteger)
    view_count = Column(BigInteger)

    created_at = Column(DateTime)
    visited_at = Column(DateTime)
    prev_date_visited = Column(DateTime)

    logo_url = Column(String, unique=True, index=True, nullable=True)
    linkedin = Column(String, unique=True, index=True, nullable=True)
    twitter = Column(String, unique=True, index=True, nullable=True)
    instagram = Column(String, unique=True, index=True, nullable=True)
    facebook = Column(String, unique=True, index=True, nullable=True)
    youtube = Column(String, unique=True, index=True, nullable=True)
    tiktok = Column(String, unique=True, index=True, nullable=True)
    mail = Column(String, unique=True, index=True, nullable=True)
    mail_bussiness = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True)

    language = Column(String)
    nationality = Column(String)
    location = Column(String)
    website = Column(String, unique=True, index=True, nullable=True)

    state = Column(Integer, default=0)

    user = relationship("User", back_populates="channel")
    videos = relationship("Video", back_populates="channel")


# ─────────────────────────────────────────────
# Video
# ─────────────────────────────────────────────

class Video(Base):
    __tablename__ = "video"

    id = Column(Integer, primary_key=True)
    url = Column(String, nullable=False)

    youtube_video_id = Column(String, unique=True, index=True)
    title = Column(String)
    language = Column(String)
    key_words = Column(String)
    state = Column(String)

    category = Column(String)
    main_category = Column(String)
    topic = Column(String)
    duration = Column(String)

    description = Column(Text)
    rich_description = Column(Text)

    prev_view_count = Column(BigInteger)
    prev_like_count = Column(BigInteger)
    view_count = Column(BigInteger)
    like_count = Column(BigInteger)
    print_count = Column(BigInteger)

    logo_url = Column(String)
    published_at = Column(DateTime)

    is_podcast = Column(Boolean)
    visited_at = Column(DateTime)
    prev_date_visited = Column(DateTime)

    guest_count = Column(Integer, default=0)

    channel_id = Column(Integer, ForeignKey("channel.id"))

    channel = relationship("Channel", back_populates="videos")
    interviewers = relationship(
        "Interviewer",
        secondary="interviewervideolink",
        back_populates="videos",
    )

    __table_args__ = (
        Index("ix_video_category", "category"),
        Index("ix_video_main_category", "main_category"),
        Index("ix_video_published_at", "published_at"),
    )


# ─────────────────────────────────────────────
# Interviewer
# ─────────────────────────────────────────────

class Interviewer(Base):
    __tablename__ = "interviewer"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, index=True, nullable=True)

    name = Column(String)
    activity = Column(String)
    expertise = Column(String)
    biography = Column(Text)

    language = Column(String)
    location = Column(String)
    country = Column(String)
    nationality = Column(String)

    is_hoster = Column(Boolean)
    image_profil = Column(String)

    print_count = Column(BigInteger)
    visited_at = Column(DateTime)

    linkedin = Column(String, unique=True, index=True)
    twitter = Column(String, unique=True, index=True)
    instagram = Column(String, unique=True, index=True)
    facebook = Column(String, unique=True, index=True)
    youtube = Column(String, unique=True, index=True)
    tiktok = Column(String, unique=True, index=True)

    tiktok_followers = Column(Integer)
    tiktok_hearts = Column(Integer)
    tiktok_videos = Column(Integer)

    twitter_followers = Column(Integer)
    twitter_likes = Column(Integer)
    twitter_tweets = Column(Integer)

    linkedin_followers = Column(Integer)
    instagram_followers = Column(Integer)
    instagram_posts = Column(Integer)

    facebook_followers = Column(Integer)
    facebook_likes = Column(Integer)

    youtube_subscribers = Column(Integer)
    youtube_videos = Column(Integer)
    youtube_views = Column(Integer)

    wikipedia = Column(String, unique=True, index=True)
    mail = Column(String, unique=True, index=True)
    website = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)

    suggested_topic = Column(String)
    is_reviewed = Column(Boolean)
    user = relationship("User", back_populates="interviewer")
    videos = relationship(
        "Video",
        secondary="interviewervideolink",
        back_populates="interviewers",
    )
    followers = relationship(
        "User",
        secondary="follow",
        back_populates="following",
    )

    __table_args__ = (
        Index("ix_interviewer_country", "country"),
        Index("ix_interviewer_location", "location"),
        Index("ix_interviewer_expertise", "expertise"),
    )
class InterviewerStats(Base):
    __tablename__ = "interviewer_stats"

    interviewer_id = Column(
        Integer,
        ForeignKey("interviewer.id", ondelete="CASCADE"),
        primary_key=True,
    )

    video_count = Column(Integer, nullable=False, default=0)
    total_views = Column(BigInteger, nullable=False, default=0)
    total_likes = Column(BigInteger, nullable=False, default=0)
    latest_published_at = Column(DateTime, nullable=True)
    folowers_count = Column(Integer, default=0)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
