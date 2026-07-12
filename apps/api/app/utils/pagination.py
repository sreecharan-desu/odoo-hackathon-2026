"""Pagination helpers for list endpoints."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, TypeVar

from sqlalchemy.orm import Query

T = TypeVar("T")

DEFAULT_LIMIT = 25
MAX_LIMIT = 100


@dataclass
class Page(Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int


def clamp_limit(limit: int) -> int:
    return max(1, min(limit, MAX_LIMIT))


def paginate(query: Query, *, limit: int = DEFAULT_LIMIT, offset: int = 0) -> Page:
    limit = clamp_limit(limit)
    offset = max(0, offset)
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return Page(items=items, total=total, limit=limit, offset=offset)
