from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database.model import Channel


def get_channel_by_id(db: Session, channel_id: int) -> Optional[Channel]:
    """
    Récupère une chaîne (Channel) depuis la base de données en utilisant son ID.

    :param db: Session asynchrone de base de données.
    :param channel_id: ID de la chaîne à récupérer.
    :return: L'objet Channel si trouvé, sinon None.
    """
    try:
        statement = select(Channel).where(Channel.id == channel_id)
        result = db.execute(statement)
        channel = result.scalars().first()
        return channel
    except Exception as e:
        print("error in function get_channel_by_id:", e)
        return None

def get_channel_by_youtube_id(db: Session, youtube_channel_id: int) -> Optional[Channel]:
    """
    Récupère une chaîne (Channel) depuis la base de données en utilisant son ID de la chaine youtube.

    :param db: Session asynchrone de base de données.
    :param channel_id: ID de la chaîne à récupérer.
    :return: L'objet Channel si trouvé, sinon None.
    """
    try:
        statement = select(Channel).where(Channel.youtube_channel_id == youtube_channel_id)
        result = db.execute(statement)
        channel = result.scalars().first()
        return channel
    except Exception as e:
        print("error in function get_channel_by_id:", e)
        return None

def get_channel_by_youtube_name(db: Session, channel_name: str) -> Optional[Channel]:
    """
    Récupère une chaîne (Channel) depuis la base de données en utilisant le nom de la chaine youtube.

    :param db: Session asynchrone de base de données.
    :param channel_name: ID de la chaîne à récupérer.
    :return: L'objet Channel si trouvé, sinon None.
    """
    try:
        if not channel_name:
            return
        channel_name = channel_name.strip().lower()
        statement = select(Channel).where(Channel.name == channel_name)
        result = db.execute(statement)
        channel = result.scalars().first()
        return channel
    except Exception as e:
        print("error in function get_channel_by_id:", e)
        return None


def update_channel(db: Session, updated_channel: Channel) -> Optional[Channel]:
    try:
        if updated_channel.id is None:
            print("update_channel_if_exists: Aucun ID fourni.")
            return None

        statement = select(Channel).where(Channel.id == updated_channel.id)
        result = db.execute(statement)
        existing_channel = result.scalars().first()

        if not existing_channel:
            print(f"Aucun channel trouvé avec l'ID {updated_channel.id}")
            return None

        for field, value in updated_channel.model_dump(exclude_unset=True).items():
            if field == "playlist" and value is not None:
                value = "|".join(value)
            if value is not None:
                setattr(existing_channel, field, value)

        db.commit()
        db.refresh(existing_channel)
        return existing_channel

    except SQLAlchemyError as e:
        print("Erreur dans update_channel_if_exists:", e)
        db.rollback()
        return None


def save_channel(db: Session, channel: Channel) -> Optional[Channel]:
    """
    Ajoute un objet Channel dans la base de données et retourne l'objet avec son ID.

    :param db: Session asynchrone de base de données.
    :param channel: Objet Channel à ajouter.
    :return: L'objet Channel inséré avec son ID (ou None si erreur).
    """
    try:
        db.add(channel)
        db.commit()
        db.refresh(channel)  
        return channel
    except SQLAlchemyError as e:
        db.rollback()
        print("Erreur dans save_channel:", e)
        return None

def save_all_channels(db: Session, channels: list[Channel]) -> list[Channel] | None:
    """
    Ajoute une liste de channels dans la base de données et retourne les objets avec leurs IDs mis à jour.
    
    :param db: La session de base de données utilisée pour effectuer l'ajout.
    :param channels: Une liste d'objets `Channel` à ajouter dans la base.
    :return: La liste des objets avec leurs IDs mis à jour, ou None en cas d'erreur.
    """
    try:
        db.add_all(channels)
        db.flush()  
        db.commit()
        return channels
    except Exception as e:
        db.rollback()
        print("❌ Erreur dans save_all_channels:", e)
        return None

def get_channel_by_youtube_id(
    db: Session,
    youtube_channel_id: str
) -> Optional[Channel]:
    """
    Récupère un channel via son identifiant YouTube.

    :param db: Session asynchrone de base de données.
    :param youtube_channel_id: L'identifiant YouTube du channel.
    :return: L'objet Channel si trouvé, sinon None.
    """
    try:
        statement = select(Channel).where(Channel.youtube_channel_id == youtube_channel_id)
        result = db.execute(statement)
        channel = result.scalars().first()
        return channel
    except SQLAlchemyError as e:
        print("Erreur dans get_channel_by_youtube_id:", e)
        return None

def get_channels_with_state(
    db: Session,
    state: int,
    limit: int = 100
) -> Optional[List[Channel]]:
    """
    Récupère une liste de channels dont le state est inférieur ou égal à `state`, avec une limite.

    :param db: Session asynchrone de base de données.
    :param state: Valeur maximale du champ `state`.
    :param limit: Nombre maximum de channels à retourner.
    :return: Liste des objets Channel ou None en cas d'erreur.
    """
    try:
        statement = (
            select(Channel)
            .where(Channel.state <= state)
            .limit(limit)
        )
        result = db.execute(statement)
        channels = result.scalars().all()
        return channels
    except SQLAlchemyError as e:
        print("Erreur dans get_channels_with_state:", e)
        return None    

def get_all_channel(db: Session, offset: int = 0, limit: int = 100) -> List[Channel]:
    """
    Récupère une liste paginée d'objets Channel depuis la base de données.

    :param db: Session asynchrone de base de données.
    :param offset: Nombre d'éléments à ignorer (pagination).
    :param limit: Nombre maximum d'éléments à retourner.
    :return: Liste d'objets Channel.
    """
    try:
        result = db.execute(
            select(Channel).offset(offset).limit(limit)
        )
        channels = result.scalars().all()
        return channels
    except Exception as e:
        print("Erreur dans get_all_channel:", e)
        return None
    
def get_channels_with_state_zero(
    db: Session,
    limit: int = 1
) -> Optional[List[Channel]]:
    """
    Récupère les channels dont le state est égal à 0, avec une limite sur le nombre de résultats.

    :param db: Session asynchrone de base de données.
    :param limit: Nombre maximum de channels à récupérer.
    :return: Liste des objets Channel avec state == 0, ou None en cas d'erreur.
    """
    try:
        statement = (
            select(Channel)
            .where(Channel.state == 0)
            .limit(limit)
        )
        result = db.execute(statement)
        channels = result.scalars().all()
        return channels
    except Exception as e:
        print("Erreur dans get_channels_with_state_zero:", e)
        return None
    

    