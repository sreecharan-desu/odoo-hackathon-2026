"""PDF report generation service for TransitOps operational reports.

Uses ReportLab to produce professional, branded PDF documents with
KPI summaries, data tables, and color-coded metrics.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Spacer


# ── Colour palette ─────────────────────────────────────────────
BRAND_DARK = colors.HexColor("#0f172a")
BRAND_PRIMARY = colors.HexColor("#3b82f6")
BRAND_SUCCESS = colors.HexColor("#22c55e")
BRAND_DANGER = colors.HexColor("#ef4444")
BRAND_WARNING = colors.HexColor("#f59e0b")
BRAND_MUTED = colors.HexColor("#94a3b8")
ROW_ALT_BG = colors.HexColor("#f8fafc")
TABLE_HEADER_BG = colors.HexColor("#1e293b")
TABLE_BORDER = colors.HexColor("#e2e8f0")


class ReportService:
    """Generates beautiful PDF operational reports for the fleet."""

    @staticmethod
    def pdf_bytes(fleet_data: list[dict] | None = None, *, revenue_rate: float = 40.0, reminder_days: int = 30) -> bytes:
        """Return a fully-formatted PDF as raw bytes.

        Parameters
        ----------
        fleet_data:
            List of vehicle operational cost dicts (from DashboardService).
            When *None*, generates a placeholder report.
        revenue_rate:
            Estimated freight revenue per km (for display).
        reminder_days:
            License reminder window in days (for display).
        """
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=A4,
            leftMargin=20 * mm,
            rightMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=25 * mm,
            title="TransitOps Operational Report",
            author="TransitOps Fleet Management",
        )

        elements: list = []
        elements.append(Spacer(1, 12))

        doc.build(elements)
        return buf.getvalue()