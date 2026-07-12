from __future__ import annotations

from app.core.config import settings


class ReportService:
    @staticmethod
    def pdf_bytes() -> bytes:
        # Small self-contained PDF; keeps the bonus feature dependency-free.
        body = (
            "TransitOps Operational Summary\n\n"
            f"Estimated freight revenue rate: ₹{settings.estimated_freight_revenue_per_km:.2f}/km\n"
            f"License reminder window: {settings.license_reminder_days} days\n"
            "\nThis report is generated from the live fleet dashboard."
        )
        escaped_body = body.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        stream = f"BT /F1 12 Tf 72 740 Td ({escaped_body}) Tj ET"
        objects = [
            b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
            b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
            b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n",
            b"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
        ]
        content = stream.encode("latin-1", errors="ignore")
        pdf = bytearray(b"%PDF-1.4\n")
        offsets = [0]
        for obj in objects:
            offsets.append(len(pdf))
            pdf.extend(obj)
        offsets.append(len(pdf))
        pdf.extend(f"5 0 obj << /Length {len(content)} >> stream\n".encode())
        pdf.extend(content)
        pdf.extend(b"\nendstream\nendobj\n")
        xref = len(pdf)
        pdf.extend(b"xref\n0 6\n0000000000 65535 f \n")
        for offset in offsets[1:]:
            pdf.extend(f"{offset:010d} 00000 n \n".encode())
        pdf.extend(
            b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n"
            + str(xref).encode()
            + b"\n%%EOF\n"
        )
        return bytes(pdf)