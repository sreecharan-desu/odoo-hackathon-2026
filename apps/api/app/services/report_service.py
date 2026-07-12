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

    # ── KPI summary cards ──────────────────────────────────────
    @staticmethod
    def _build_kpi_summary(rows: list[dict], revenue_rate: float, reminder_days: int) -> list:
        """Compute fleet-wide KPIs and render as styled summary cards."""
        total_vehicles = len(rows)
        active_vehicles = sum(1 for v in rows if v.get("status") != "Retired")
        on_trip = sum(1 for v in rows if v.get("status") == "On Trip")
        utilization = round((on_trip / max(active_vehicles, 1)) * 100, 1)

        efficiencies = [v["fuel_efficiency_km_per_l"] for v in rows if v.get("fuel_efficiency_km_per_l")]
        avg_eff = round(sum(efficiencies) / len(efficiencies), 1) if efficiencies else 0

        total_fuel = sum(v.get("fuel_cost", 0) for v in rows)
        total_maint = sum(v.get("maintenance_cost", 0) for v in rows)
        total_cost = sum(v.get("total_operational_cost", 0) for v in rows)
        total_revenue = sum(v.get("estimated_revenue", 0) for v in rows)

        kpi_label = ParagraphStyle("KpiLabel", fontName="Helvetica", fontSize=7.5, textColor=BRAND_MUTED)
        kpi_value = ParagraphStyle("KpiValue", fontName="Helvetica-Bold", fontSize=13, textColor=BRAND_DARK, spaceBefore=2)

        def _card(label: str, value: str) -> Table:
            t = Table(
                [[Paragraph(label, kpi_label)], [Paragraph(value, kpi_value)]],
                colWidths=["100%"],
            )
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), ROW_ALT_BG),
                ("BOX", (0, 0), (-1, -1), 0.5, TABLE_BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("ROUNDEDCORNERS", [4, 4, 4, 4]),
            ]))
            return t

        cards = [
            _card("Fleet Size", f"{total_vehicles} vehicles"),
            _card("Active / On Trip", f"{active_vehicles} / {on_trip}"),
            _card("Utilization", f"{utilization}%"),
            _card("Avg Fuel Efficiency", f"{avg_eff} km/L" if avg_eff else "—"),
        ]

        row1 = Table([cards], colWidths=["25%"] * 4)
        row1.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ]))

        cards2 = [
            _card("Total Fuel Cost", _fmt_inr(total_fuel)),
            _card("Total Maintenance", _fmt_inr(total_maint)),
            _card("Total Ops Cost", _fmt_inr(total_cost)),
            _card("Est. Revenue", _fmt_inr(total_revenue)),
        ]

        row2 = Table([cards2], colWidths=["25%"] * 4)
        row2.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ]))

        # Section label
        section_title = Paragraph(
            "Fleet Overview",
            ParagraphStyle("SectionTitle", fontName="Helvetica-Bold", fontSize=12, textColor=BRAND_DARK, spaceBefore=0, spaceAfter=6),
        )

        # Config note
        config_note = Paragraph(
            f"Revenue rate: Rs {revenue_rate:.2f}/km  •  License reminder window: {reminder_days} days",
            ParagraphStyle("ConfigNote", fontName="Helvetica", fontSize=7.5, textColor=BRAND_MUTED, spaceBefore=6),
        )

        return [section_title, row1, Spacer(1, 6), row2, config_note, Spacer(1, 18)]

    # ── Data table ─────────────────────────────────────────────
    @staticmethod
    def _build_data_table(rows: list[dict]) -> list:
        """Build the per-vehicle operational cost table."""
        HEADER_STYLE = ParagraphStyle(
            "TH", fontName="Helvetica-Bold", fontSize=7, textColor=colors.white, leading=9,
        )
        CELL_STYLE = ParagraphStyle(
            "TD", fontName="Helvetica", fontSize=7, textColor=BRAND_DARK, leading=9,
        )
        CELL_BOLD = ParagraphStyle(
            "TDBold", fontName="Helvetica-Bold", fontSize=7, textColor=BRAND_DARK, leading=9,
        )

        headers = [
            Paragraph("Vehicle", HEADER_STYLE),
            Paragraph("Type", HEADER_STYLE),
            Paragraph("Status", HEADER_STYLE),
            Paragraph("Distance", HEADER_STYLE),
            Paragraph("Fuel Eff.", HEADER_STYLE),
            Paragraph("Fuel Cost", HEADER_STYLE),
            Paragraph("Maint.", HEADER_STYLE),
            Paragraph("Other", HEADER_STYLE),
            Paragraph("Total Cost", HEADER_STYLE),
            Paragraph("Revenue", HEADER_STYLE),
            Paragraph("ROI", HEADER_STYLE),
        ]

        data = [headers]

        for v in rows:
            roi_val = v.get("roi")
            roi_color = BRAND_SUCCESS if roi_val is not None and roi_val >= 0 else BRAND_DANGER
            roi_style = ParagraphStyle("ROI", fontName="Helvetica-Bold", fontSize=7, textColor=roi_color, leading=9)

            data.append([
                Paragraph(f"{v.get('registration_number', '')}<br/><font size=5 color='#94a3b8'>{v.get('name', '')}</font>", CELL_BOLD),
                Paragraph(v.get("vehicle_type", "—") or "—", CELL_STYLE),
                Paragraph(v.get("status", "—"), CELL_STYLE),
                Paragraph(f"{v.get('distance_km', 0):.0f} km", CELL_STYLE),
                Paragraph(f"{v['fuel_efficiency_km_per_l']:.1f}" if v.get("fuel_efficiency_km_per_l") else "—", CELL_STYLE),
                Paragraph(_fmt_inr(v.get("fuel_cost", 0)), CELL_STYLE),
                Paragraph(_fmt_inr(v.get("maintenance_cost", 0)), CELL_STYLE),
                Paragraph(_fmt_inr(v.get("other_expenses", 0)), CELL_STYLE),
                Paragraph(_fmt_inr(v.get("total_operational_cost", 0)), CELL_BOLD),
                Paragraph(_fmt_inr(v.get("estimated_revenue", 0)), CELL_STYLE),
                Paragraph(_fmt_roi(roi_val), roi_style),
            ])

        col_widths = [70, 42, 42, 42, 35, 52, 47, 42, 52, 52, 35]

        table = Table(data, colWidths=col_widths, repeatRows=1)
        style_commands = [
            # Header row
            ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 7),
            # Grid
            ("GRID", (0, 0), (-1, -1), 0.5, TABLE_BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]

        # Alternating row backgrounds
        for i in range(1, len(data)):
            if i % 2 == 0:
                style_commands.append(("BACKGROUND", (0, i), (-1, i), ROW_ALT_BG))

        table.setStyle(TableStyle(style_commands))

        section_title = Paragraph(
            "Vehicle Operational Costs",
            ParagraphStyle("TableSectionTitle", fontName="Helvetica-Bold", fontSize=12, textColor=BRAND_DARK, spaceAfter=8),
        )
        note = Paragraph(
            "ROI = (Estimated revenue - Maintenance - Fuel) / Acquisition cost.  Revenue = completed trip km x Rs 40.",
            ParagraphStyle("TableNote", fontName="Helvetica", fontSize=6.5, textColor=BRAND_MUTED, spaceBefore=6),
        )

        return [section_title, table, note, Spacer(1, 12)]

    # ── Cost breakdown summary ─────────────────────────────────
    @staticmethod
    def _build_cost_breakdown(rows: list[dict]) -> list:
        """Render a compact cost-category breakdown."""
        total_fuel = sum(v.get("fuel_cost", 0) for v in rows)
        total_maint = sum(v.get("maintenance_cost", 0) for v in rows)
        total_other = sum(v.get("other_expenses", 0) for v in rows)
        grand = total_fuel + total_maint + total_other or 1

        LABEL = ParagraphStyle("BDLabel", fontName="Helvetica", fontSize=8, textColor=BRAND_DARK)
        VALUE = ParagraphStyle("BDValue", fontName="Helvetica-Bold", fontSize=8, textColor=BRAND_DARK)
        PCT = ParagraphStyle("BDPct", fontName="Helvetica", fontSize=7.5, textColor=BRAND_MUTED)

        breakdown_data = [
            [
                Paragraph("Category", ParagraphStyle("BDH", fontName="Helvetica-Bold", fontSize=8, textColor=colors.white)),
                Paragraph("Amount", ParagraphStyle("BDH2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.white)),
                Paragraph("Share", ParagraphStyle("BDH3", fontName="Helvetica-Bold", fontSize=8, textColor=colors.white)),
            ],
            [Paragraph("Fuel Costs", LABEL), Paragraph(_fmt_inr(total_fuel), VALUE), Paragraph(f"{total_fuel / grand * 100:.1f}%", PCT)],
            [Paragraph("Maintenance", LABEL), Paragraph(_fmt_inr(total_maint), VALUE), Paragraph(f"{total_maint / grand * 100:.1f}%", PCT)],
            [Paragraph("Other Expenses", LABEL), Paragraph(_fmt_inr(total_other), VALUE), Paragraph(f"{total_other / grand * 100:.1f}%", PCT)],
            [
                Paragraph("Total", ParagraphStyle("BDTotal", fontName="Helvetica-Bold", fontSize=8.5, textColor=BRAND_DARK)),
                Paragraph(_fmt_inr(grand), ParagraphStyle("BDTotalV", fontName="Helvetica-Bold", fontSize=8.5, textColor=BRAND_PRIMARY)),
                Paragraph("100%", PCT),
            ],
        ]

        bd_table = Table(breakdown_data, colWidths=[160, 120, 60])
        bd_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, TABLE_BORDER),
            ("BACKGROUND", (0, -1), (-1, -1), ROW_ALT_BG),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))

        section_title = Paragraph(
            "Cost Breakdown Summary",
            ParagraphStyle("BreakdownTitle", fontName="Helvetica-Bold", fontSize=12, textColor=BRAND_DARK, spaceAfter=8),
        )

        return [section_title, bd_table, Spacer(1, 16)]

    # ── Top/Bottom performers ──────────────────────────────────
    @staticmethod
    def _build_highlights(rows: list[dict]) -> list:
        """Show best and worst performing vehicles."""
        if len(rows) < 2:
            return []

        HIGHLIGHT_LABEL = ParagraphStyle("HLLabel", fontName="Helvetica", fontSize=8, textColor=BRAND_DARK)
        HIGHLIGHT_VALUE = ParagraphStyle("HLValue", fontName="Helvetica-Bold", fontSize=8, textColor=BRAND_DARK)

        # Sort by ROI
        with_roi = [v for v in rows if v.get("roi") is not None]
        best_roi = max(with_roi, key=lambda v: v["roi"]) if with_roi else None
        worst_roi = min(with_roi, key=lambda v: v["roi"]) if with_roi else None

        # Sort by efficiency
        with_eff = [v for v in rows if v.get("fuel_efficiency_km_per_l") and v["fuel_efficiency_km_per_l"] > 0]
        best_eff = max(with_eff, key=lambda v: v["fuel_efficiency_km_per_l"]) if with_eff else None

        # Most expensive to operate
        most_costly = max(rows, key=lambda v: v.get("total_operational_cost", 0))

        highlight_data = [
            [
                Paragraph("Metric", ParagraphStyle("HLH", fontName="Helvetica-Bold", fontSize=8, textColor=colors.white)),
                Paragraph("Vehicle", ParagraphStyle("HLH2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.white)),
                Paragraph("Value", ParagraphStyle("HLH3", fontName="Helvetica-Bold", fontSize=8, textColor=colors.white)),
            ],
        ]

        if best_roi:
            highlight_data.append([
                Paragraph("Best ROI", HIGHLIGHT_LABEL),
                Paragraph(best_roi["registration_number"], HIGHLIGHT_VALUE),
                Paragraph(_fmt_roi(best_roi["roi"]), ParagraphStyle("HLGS", fontName="Helvetica-Bold", fontSize=8, textColor=BRAND_SUCCESS)),
            ])
        if worst_roi:
            highlight_data.append([
                Paragraph("Worst ROI", HIGHLIGHT_LABEL),
                Paragraph(worst_roi["registration_number"], HIGHLIGHT_VALUE),
                Paragraph(_fmt_roi(worst_roi["roi"]), ParagraphStyle("HLRS", fontName="Helvetica-Bold", fontSize=8, textColor=BRAND_DANGER)),
            ])
        if best_eff:
            highlight_data.append([
                Paragraph("Best Fuel Efficiency", HIGHLIGHT_LABEL),
                Paragraph(best_eff["registration_number"], HIGHLIGHT_VALUE),
                Paragraph(f"{best_eff['fuel_efficiency_km_per_l']:.1f} km/L", HIGHLIGHT_VALUE),
            ])
        highlight_data.append([
            Paragraph("Highest Ops Cost", HIGHLIGHT_LABEL),
            Paragraph(most_costly.get("registration_number", ""), HIGHLIGHT_VALUE),
            Paragraph(_fmt_inr(most_costly.get("total_operational_cost", 0)), ParagraphStyle("HLWC", fontName="Helvetica-Bold", fontSize=8, textColor=BRAND_WARNING)),
        ])

        hl_table = Table(highlight_data, colWidths=[140, 130, 100])
        hl_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, TABLE_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))

        # Alternating rows
        for i in range(1, len(highlight_data)):
            if i % 2 == 0:
                hl_table_style = ("BACKGROUND", (0, i), (-1, i), ROW_ALT_BG)
                hl_table.setStyle(TableStyle([hl_table_style]))

        section_title = Paragraph(
            "Performance Highlights",
            ParagraphStyle("HighlightsTitle", fontName="Helvetica-Bold", fontSize=12, textColor=BRAND_DARK, spaceAfter=8),
        )

        return [section_title, hl_table, Spacer(1, 16)]

    # ── Footer callback ─────────────────────────────────────────
    @staticmethod
    def _draw_footer(canvas, doc):
        """Draw page number and branding in the footer of every page."""
        canvas.saveState()
        page_width = A4[0]

        # Divider line
        canvas.setStrokeColor(TABLE_BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(20 * mm, 18 * mm, page_width - 20 * mm, 18 * mm)

        # Left: branding
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(BRAND_MUTED)
        canvas.drawString(20 * mm, 14 * mm, "TransitOps Fleet Management  •  Confidential")

        # Right: page number
        canvas.drawRightString(page_width - 20 * mm, 14 * mm, f"Page {doc.page}")

        canvas.restoreState()

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

        # KPI cards + data table
        rows = fleet_data or []
        if rows:
            elements.extend(ReportService._build_kpi_summary(rows, revenue_rate, reminder_days))
            elements.extend(ReportService._build_data_table(rows))
            elements.extend(ReportService._build_cost_breakdown(rows))
            elements.extend(ReportService._build_highlights(rows))

            # Generated notice
            elements.append(Spacer(1, 8))
            elements.append(
                Paragraph(
                    f"This report was automatically generated on {now.strftime('%B %d, %Y at %I:%M %p UTC')} "
                    "from live fleet data. Figures are estimates based on logged trips, fuel entries, and maintenance records.",
                    ParagraphStyle("Disclaimer", fontName="Helvetica-Oblique", fontSize=7, textColor=BRAND_MUTED, alignment=1),
                )
            )
        else:
            elements.append(Spacer(1, 40))
            elements.append(
                Paragraph(
                    "No vehicle data available. Add vehicles and log trips to see operational metrics.",
                    ParagraphStyle("Empty", fontName="Helvetica", fontSize=11, textColor=BRAND_MUTED, alignment=1),
                )
            )

        doc.build(
            elements,
            onFirstPage=ReportService._draw_footer,
            onLaterPages=ReportService._draw_footer,
        )
        return buf.getvalue()