from datetime import datetime, timezone

def split_string_to_list(value):
    """Convertit une chaîne séparée par '|' en liste"""
    if isinstance(value, str):
        return [item.strip() for item in value.split("|") if item.strip()]
    return value

def format_video_duration(published_at) -> str:
    """
    Converts a publication date (datetime or ISO string) into a human-readable
    English relative time: 'just now', '5 minutes ago', '3 hours ago', etc.
    """
    if published_at is None:
        return "Unknown date"

    if isinstance(published_at, datetime):
        published_dt = published_at
    elif isinstance(published_at, str):
        try:
            published_dt = datetime.fromisoformat(published_at)
        except ValueError:
            return "Invalid date"
    else:
        return "Unrecognized format"

    if published_dt.tzinfo is None:
        published_dt = published_dt.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    diff = now - published_dt
    seconds = int(diff.total_seconds())

    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif seconds < 604800:
        days = seconds // 86400
        return f"{days} day{'s' if days > 1 else ''} ago"
    elif seconds < 2592000:
        weeks = seconds // 604800
        return f"{weeks} week{'s' if weeks > 1 else ''} ago"
    elif seconds < 31536000:
        months = seconds // 2592000
        return f"{months} month{'s' if months > 1 else ''} ago"
    else:
        years = seconds // 31536000
        return f"{years} year{'s' if years > 1 else ''} ago"

def process_interviewer_dict(interviewer_dict):
    """Traite un dictionnaire interviewer comme le faisaient les validators Pydantic"""
    interviewer_dict['expertise'] = split_string_to_list(interviewer_dict.get('expertise'))
    interviewer_dict['suggested_topic'] = split_string_to_list(interviewer_dict.get('suggested_topic'))
    
    if interviewer_dict.get('image_profil'):
        interviewer_dict['image_profil'] = f"http://76.13.25.132/static/profil_images/{interviewer_dict['image_profil']}"

    if interviewer_dict.get('expertise') and len(interviewer_dict['expertise']) > 2:
        interviewer_dict['expertise'] = interviewer_dict['expertise'][:2]

    if interviewer_dict.get('activity'):
        interviewer_dict['activity'] = interviewer_dict['activity'].replace(";", ",")

    social_links = ["linkedin", "twitter", "instagram", "facebook", "youtube", "tiktok", "wikipedia", "website"]
    for link in social_links:
        url = interviewer_dict.get(link)
        if url and url.endswith("|existed"):
            url = url.split("|")[0].strip()
            interviewer_dict[link] = url
        else:
            interviewer_dict[link] = None

    return interviewer_dict

def process_video_dict(video_dict):
    """Traite un dictionnaire video """
    video_dict['duration_posted'] = format_video_duration(video_dict.get('published_at'))
    return video_dict


