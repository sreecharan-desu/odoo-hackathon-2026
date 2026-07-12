"""Link drivers.user_id to users for driver-role accounts.

Revision ID: 0002_driver_user
Revises: 0001_initial
Create Date: 2026-07-12
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_driver_user"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("drivers", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index("ix_drivers_user_id", "drivers", ["user_id"], unique=True)
    op.create_foreign_key(
        "fk_drivers_user_id_users",
        "drivers",
        "users",
        ["user_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_drivers_user_id_users", "drivers", type_="foreignkey")
    op.drop_index("ix_drivers_user_id", table_name="drivers")
    op.drop_column("drivers", "user_id")
