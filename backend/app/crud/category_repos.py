from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.model import Category, Suggestion, Video

def get_all_main_categories(db: Session) -> list[str]:
    stmt = select(Video.main_category).distinct().where(Video.main_category.isnot(None))
    result = db.execute(stmt)
    categories = [row[0] for row in result.all()]
    return categories

def get_subcategories_by_main_category(db: Session, main_category: str) -> list[str]:
    stmt = (
        select(Video.category)  
        .distinct()
        .where(
            func.lower(Video.main_category) == func.lower(main_category),
            Video.category.isnot(None),
            func.lower(Video.category) != func.lower(main_category)  

        )
    )
    result = db.execute(stmt)
    subcategories = [row[0] for row in result.all()]
    return subcategories

def get_suggested_categories(session: Session, user_id: int):
    # Récupérer les catégories associées à l'utilisateur
    try:
        statement = (
        select(Category)
        .join(Suggestion, Suggestion.category_id == Category.id)
        .where(Suggestion.user_id == user_id)
        )
        result = session.execute(statement)
        categories = result.scalars().all()
        category_names = [c.name for c in categories]
        return category_names
    except Exception as e:
        print("error in function get_suggested_categories:",e)
        return None