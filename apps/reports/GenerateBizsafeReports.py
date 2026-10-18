import html
import re

import weasyprint
from django.utils import timezone

from apps.reports.GenerateReport import FincheckReportPDF 

class BizsafeReportListPDF(FincheckReportPDF):
    def __init__(self, group_by: str, period_label: str, entity_name: str, reports: list) -> None:
        self._group_by = group_by
        self._period_label = period_label
        self._entity_name = entity_name
        self._reports = reports

    def filename(self) -> str:
        slug = re.sub(r"[^A-Za-z0-9]", "", self._period_label)          # "Sep-26" -> "Sep26"
        safe = re.sub(r'[\\/:*?"<>|]', "", self._entity_name).strip()
        return f"{safe} Report List {slug}.pdf"

    @staticmethod
    def _fmt_date(value) -> str:
        return timezone.localtime(value).strftime("%d-%b-%y") if value else "—"

    def _css(self) -> str:
        c = self
        return f"""
@page {{
  size: A4; margin: 14mm 14mm 18mm 14mm;
  @bottom-center {{ content: "CONFIDENTIAL — FOR AUTHORISED USE ONLY"; font-size: 7pt; color: {c.MUTED}; }}
  @bottom-right {{ content: "Page " counter(page); font-size: 7.5pt; color: {c.MUTED}; }}
}}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font-family: "Segoe UI", Helvetica, Arial, sans-serif; font-size: 9pt; color: {c.TEXT}; line-height: 1.55; }}
.head {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }}
.logo {{ height: 52px; }}
.logo-fallback {{ font-size: 22pt; font-weight: 800; color: {c.PRIMARY}; }}
.addr {{ text-align: right; font-size: 8pt; color: {c.MUTED}; line-height: 1.7; }}
.addr b {{ display: block; font-size: 11pt; color: {c.PRIMARY}; }}
.title {{ font-size: 11pt; font-weight: 800; color: {c.PRIMARY}; text-transform: uppercase; margin-bottom: 18px; }}
.data-table {{ width: 100%; border-collapse: collapse; }}
.data-table th {{ background: {c.ACCENT}; color: #fff; padding: 8px 10px; font-size: 7.5pt; text-align: left;
                  text-transform: uppercase; letter-spacing: .4px; }}
.data-table td {{ padding: 8px 10px; font-size: 8.5pt; border-bottom: 1px solid #F1F5F9; }}
.data-table tbody tr {{ break-inside: avoid; }}
.data-table tbody tr:nth-child(even) {{ background: {c.ROW}; }}
.nowrap {{ white-space: nowrap; }}
.ta-c {{ text-align: center; }}
"""

    def _build_html(self) -> str:
        other = "Subject" if self._group_by == "client" else "Client"
        rows = "".join(
            f"<tr><td>{html.escape(r['enquiry_reference'])}</td>"
            f"<td>{html.escape(r['name'])}</td>"
            f"<td class='nowrap'>{self._fmt_date(r['report_date'])}</td></tr>"
            for r in self._reports
        )
        table = self._data_table(["Enq Ref", other, "Report Date"], rows)
        return f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>{html.escape(self.filename())}</title><style>{self._css()}</style></head>
<body>
  <div class="head">
    <div>{self._logo_tag()}</div>
    <div class="addr">
      <b>FINCHECK (PVT) LTD</b>
      8th Floor Club Chambers<br>Corner Nelson Mandela and Third Street<br>Harare, Zimbabwe<br>
      VAT Number: 220191384<br>TIN: 2000032265<br>accounts@fincheckzim.com<br>(242)-704891/4
    </div>
  </div>
  <div class="title">{html.escape(self._entity_name)}<br>Report list - {html.escape(self._period_label)}</div>
  {table}
</body></html>"""

    def generate_bytes(self) -> bytes:
        return weasyprint.HTML(string=self._build_html()).write_pdf()