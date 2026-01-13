from typing import Optional
from fastapi import APIRouter, Depends
from app.crud.category_repos import *
from app.session import get_session
router = APIRouter()

@router.get("/main")
def get_main_category(
    session: Session = Depends(get_session),
):
    main_category_names = get_all_main_categories(session)
    if not main_category_names:
        return []
    return main_category_names

@router.get("/expertises")
def get_expertises(
    session: Session = Depends(get_session),
):
    return [
    "Entrepreneur",
    "CEO",
    "Public figure",
    "Podcaster",
    "Journalist",
    "Scientist",
    "AI researcher",
    "Neuroscientist",
    "Physicist",
    "Computer scientist",
    "Software engineer",
    "Engineer",
    "Producer",
    "Philosopher",
    "Athlete",
    "Comedian",
    "Singer"
    ]

    # expertise_names = extract_top_expertises(session)
    # if not expertise_names:
    #     return []
    # return expertise_names

@router.get("/languages")
def get_languages(
    session: Session = Depends(get_session),
):
    return []
    # language_names = extract_languages(session)
    # if not language_names:
    #     return []
    # return language_names

@router.get("/locations")
def get_languages(
    session: Session = Depends(get_session),
):
    return [
        "United States",
        "China",
        "India",
        "United Kingdom",
        "France",
        "Germany",
        "Japan",
        "Canada",
        "Israel"
    ]

    # locations = extract_locations(session)
    # if not locations:
    #     return []
    # return locations


@router.get("/sub")
def get_sub_category(
    main_category: Optional[str] = None,
    session: Session = Depends(get_session),
):
    sub_category_names = get_subcategories_by_main_category(session, main_category)
    if not sub_category_names:
        return []
    return sub_category_names