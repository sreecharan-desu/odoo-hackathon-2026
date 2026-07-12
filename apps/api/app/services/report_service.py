"""PDF report generation service for TransitOps operational reports.

Uses ReportLab to produce professional, branded PDF documents with
KPI summaries, data tables, and color-coded metrics.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Spacer, Paragraph, Table, TableStyle


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

# ── Typography styles ──────────────────────────────────────────
STYLE_TITLE = ParagraphStyle(
    "ReportTitle",
    fontName="Helvetica-Bold",
    fontSize=22,
    textColor=BRAND_DARK,
    spaceAfter=2,
)
STYLE_SUBTITLE = ParagraphStyle(
    "ReportSubtitle",
    fontName="Helvetica",
    fontSize=10,
    textColor=BRAND_MUTED,
    spaceAfter=4,
)
STYLE_DATE = ParagraphStyle(
    "ReportDate",
    fontName="Helvetica",
    fontSize=9,
    textColor=BRAND_MUTED,
    alignment=2,  # right-aligned
)


# ── Formatting helpers ─────────────────────────────────────────

def _fmt_inr(amount: float, decimals: int = 0) -> str:
    """Format *amount* as Indian Rupees, e.g. Rs 12,345."""
    if not isinstance(amount, (int, float)) or amount != amount:  # NaN check
        return "Rs 0"
    sign = "-" if amount < 0 else ""
    val = abs(amount)
    integer_part = int(val)
    frac = f".{int((val - integer_part) * 10**decimals):0{decimals}d}" if decimals else ""

    # Indian grouping: last 3 digits, then groups of 2
    s = str(integer_part)
    if len(s) > 3:
        last3 = s[-3:]
        rest = s[:-3]
        grouped = ",".join([rest[max(i - 2, 0):i] for i in range(len(rest), 0, -2)][::-1])
        s = f"{grouped},{last3}"
    return f"{sign}Rs {s}{frac}"


def _fmt_roi(roi: float | None) -> str:
    """Format ROI as a percentage string."""
    if roi is None or roi != roi:  # NaN check
        return "—"
    return f"{(roi * 100):.1f}%"


class ReportService:
    """Generates beautiful PDF operational reports for the fleet."""

    # ── Header ─────────────────────────────────────────────────
    @staticmethod
    def _build_header(now: datetime) -> list:
        """Branded header with title, subtitle, and date."""
        title = Paragraph("TransitOps", STYLE_TITLE)
        subtitle = Paragraph("Fleet Operational Report", STYLE_SUBTITLE)
        date_str = now.strftime("%B %d, %Y  •  %I:%M %p UTC")
        date_para = Paragraph(date_str, STYLE_DATE)

        header_table = Table(
            [[title, date_para], [subtitle, ""]],
            colWidths=["60%", "40%"],
        )
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
        ]))

        # Divider line
        divider_data = [["" ]]
        divider = Table(divider_data, colWidths=["100%"])
        divider.setStyle(TableStyle([
            ("LINEBELOW", (0, 0), (-1, 0), 2, BRAND_PRIMARY),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))

        return [header_table, divider, Spacer(1, 14)]

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

        now = datetime.now(timezone.utc)
        elements: list = []

        # Header
        elements.extend(ReportService._build_header(now))

        doc.build(elements)
        return buf.getvalue()