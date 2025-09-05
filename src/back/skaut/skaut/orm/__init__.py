"""Database models for the Skaut application."""

from skaut.orm.base import Base
from skaut.orm.files import File
from skaut.orm.vacancy import Vacancy
from skaut.orm.cv import CV

__all__ = [
    "Base",
    "File",
    "Vacancy",
    "CV",
]
