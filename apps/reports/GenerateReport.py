from __future__ import annotations
import base64
import html
import io
import re
import os
import secrets
from datetime import date, datetime
from typing import Optional
import weasyprint
from django.conf import settings
from django.core.files.base import ContentFile
from pypdf import PdfReader, PdfWriter
from django.core.files.storage import default_storage
from urllib.parse import urlparse

def _media_root() -> str:
    return str(getattr(settings, "MEDIA_ROOT", ""))

def _media_url() -> str:
    return getattr(settings, "MEDIA_URL", "/media/")

def _default_logo_path() -> str:
    return os.path.join(settings.BASE_DIR, "apps", "reports", "static", "logo.png")
class FincheckReportPDF:
    LOGO_PATH: Optional[str] = None
    PRIMARY = "#051C2C"
    ACCENT = "#1E5474"
    TINT = "#E8F3F8"
    BORDER = "#E2E8F0"
    ROW = "#F8FAFC"
    TEXT = "#0F172A"
    MUTED = "#64748B"
    GREEN = "#15803D"
    RED = "#B91C1C"
    AMBER = "#D97706"

    def __init__(self, report) -> None:
        from apps.reports.serializers import ReportSerializer

        self._report = report
        self._overall_risk_rating = report.overall_risk_rating
        self._enq_ref = report.enquiry_reference
        self._status = getattr(report, "status", "draft")
        if report.snapshot:
            self._snapshot = report.snapshot
        else:
            self._snapshot = ReportSerializer(report).data
        self._boot()

    @classmethod
    def from_snapshot(cls, snapshot: dict, status: str = "draft") -> "FincheckReportPDF":
        obj = object.__new__(cls)
        obj._report = None
        obj._snapshot = snapshot
        obj._overall_risk_rating = snapshot.get("overall_risk_rating")
        obj._status = status
        obj._boot()
        return obj

    def _boot(self) -> None:
        self._subject_type = self._snapshot.get("subject_type", "company")
        self._client_type = self._snapshot.get("client_type", "individual")
        self._client = self._snapshot.get("client", {})
        self._subject = self._snapshot.get("subject", {})
    
    def _strip_trailing_blank_page(self, pdf_bytes: bytes) -> bytes:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = list(reader.pages)
        if len(pages) > 1:
            last_text = (pages[-1].extract_text() or "").strip()
            chrome_markers = ("CONFIDENTIAL", "Page")
            meaningful = [
                line for line in last_text.splitlines()
                if line.strip() and not any(line.strip().startswith(m) for m in chrome_markers)
            ]
            if not meaningful:
                writer = PdfWriter()
                for p in pages[:-1]:
                    writer.add_page(p)
                buf = io.BytesIO()
                writer.write(buf)
                return buf.getvalue()
        return pdf_bytes
        
    def generate_bytes(self) -> bytes:
        main_bytes = weasyprint.HTML(string=self._build_html()).write_pdf()
        main_bytes = self._strip_trailing_blank_page(main_bytes)
        return self._append_financial_attachment(main_bytes)

    def _pdf_storage_relpath(self) -> str:
        now = datetime.now()
        enq_ref = self._enq_ref
        return os.path.join(
            "reports",
            now.strftime("%Y"),
            now.strftime("%b"),
            f"{str(enq_ref)}_{secrets.token_hex(5)}.pdf",
        )

    def generate(self, output_path: Optional[str] = None) -> str:
        pdf_bytes = self.generate_bytes()
        if output_path is None:
            output_path = os.path.join(_media_root(), self._pdf_storage_relpath())
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "wb") as fh:
            fh.write(pdf_bytes)
        return output_path

    def save_to_report(self, report) -> str:
        pdf_bytes = self.generate_bytes()
        filename = os.path.basename(self._pdf_storage_relpath())
        report.report_pdf.save(filename, ContentFile(pdf_bytes), save=False)
        return report.report_pdf.url

    @staticmethod
    def _format_multiline(val_str: str, upper: bool = False) -> str:
        parts = [p.strip() for p in re.split(r'[,;/\n]+', val_str) if p.strip()]
        if len(parts) > 1:
            if upper:
                parts = [p.upper() for p in parts]
            escaped = [html.escape(p) for p in parts]
            return '<ul style="margin-left: 15px; margin-top: 4px; margin-bottom: 4px; padding-left: 10px;">' + "".join(f"<li>{line}</li>" for line in escaped) + '</ul>'
        if upper:
            val_str = val_str.upper()
        return html.escape(val_str)

    @staticmethod
    def _m(val, default: str = "—") -> str:
        if val is None or str(val).strip() in ("", "0.00"):
            return default
        return val.upper()
           
    @staticmethod
    def _u(val, default: str = "—") -> str:
        if val is None or str(val).strip() in ("", "0.00"):
            return default
        return FincheckReportPDF._format_multiline(str(val).strip(), upper=True)

    @staticmethod
    def _e(val, default: str = "—") -> str:
        if val is None or str(val).strip() in ("", "0.00"):
            return default
        return FincheckReportPDF._format_multiline(str(val).strip(), upper=False)

    @staticmethod
    def _low(val, default: str = "—") -> str:
        """Format value as lowercase — use for emails and websites."""
        if val is None or str(val).strip() == "":
            return default
        return f'<span style="text-transform:none">{html.escape(str(val).strip().lower())}</span>'

    @staticmethod
    def _date(val) -> str:
        if not val:
            return "—"
        try:
            if hasattr(val, "strftime"):
                return val.strftime("%d %B %Y").upper()
            return datetime.fromisoformat(str(val).replace("Z", "+00:00")).strftime("%d %B %Y").upper()
        except (ValueError, TypeError):
            return html.escape(str(val).upper())

    @staticmethod
    def _money(amount, currency: str = "") -> str:
        if amount is None or str(amount).strip() in ("0.00", "0", "0.0"):
            return "—"
        try:
            val_float = float(amount)
            if val_float == 0.0:
                return "—"
            prefix = f"{html.escape(str(currency))} " if currency else ""
            return f"{prefix}{val_float:,.2f}"
        except (ValueError, TypeError):
            return html.escape(str(amount))

    @staticmethod
    def _label(raw: str) -> str:
        return raw.replace("_", " ").upper() if raw else "—"

    @staticmethod
    def _badge(ok: bool, ok_t: str = "VERIFIED", fail_t: str = "UNVERIFIED") -> str:
        cls = "badge badge-ok" if ok else "badge badge-fail"
        return f'<span class="{cls}">{ok_t if ok else fail_t}</span>'

    @staticmethod
    def _status_badge(status: str) -> str:
        s = (status or "open").lower()
        cls = {"open": "badge-warn", "settled": "badge-ok", "closed": "badge-muted"}.get(s, "badge-muted")
        return f'<span class="badge {cls}">{s.upper()}</span>'

    @staticmethod
    def _card(title: str, body: str, page_break: bool = False) -> str:
        if not body or not body.strip():
            return ""
        pb = ' style="break-before:page"' if page_break else ""
        return f"""
        <div class="card"{pb}>
          <div class="card-title">{title}</div>
          <div class="card-body">{body}</div>
        </div>"""

    @staticmethod
    def _grid_table(rows: list, verified_index: Optional[dict] = None) -> str:
        """rows: [(label, value, [is_full_width]), ...] — rendered as 4-column pairs."""
        verified_index = verified_index or {}
        
        valid_rows = []
        for r in rows:
            if not r[0]:
                continue
            val = r[1]
            if val is not None:
                val_str = str(val).strip()
                if val_str and val_str not in ("-", "—"):
                    is_full = r[2] if len(r) > 2 else False
                    valid_rows.append((r[0], r[1], is_full))
        
        if not valid_rows:
            return ""

        cells = ""
        i = 0
        while i < len(valid_rows):
            left = valid_rows[i]
            extra_l = verified_index.get(left[0], "")
            
            if left[2]:
                cells += f"""
                <tr>
                  <td class="lbl">{left[0]}</td>
                  <td class="val" colspan="3">{left[1]}{extra_l}</td>
                </tr>"""
                i += 1
            else:
                right = valid_rows[i + 1] if i + 1 < len(valid_rows) and not valid_rows[i + 1][2] else ("", "", False)
                extra_r = verified_index.get(right[0], "") if right[0] else ""
                r_lbl = right[0] if right[0] else ""
                r_val = right[1] if right[0] else ""
                cells += f"""
                <tr>
                  <td class="lbl">{left[0]}</td>
                  <td class="val">{left[1]}{extra_l}</td>
                  <td class="lbl">{r_lbl}</td>
                  <td class="val">{r_val}{extra_r}</td>
                </tr>"""
                i += 2 if right[0] else 1

        return f'<table class="grid-table"><tbody>{cells}</tbody></table>'

    @staticmethod
    def _data_table(headers: list, rows_html: str, empty: str = "NOTHING TO SHOW") -> str:
        ths = "".join(f"<th>{h}</th>" for h in headers)
        if not rows_html or not rows_html.strip():
            rows_html = f'<tr><td colspan="{len(headers)}" class="ta-c empty" style="color: #64748B;">{empty}</td></tr>'
        return f"""
        <table class="data-table">
          <thead><tr>{ths}</tr></thead>
          <tbody>{rows_html}</tbody>
        </table>"""

    def _logo_tag(self) -> str:
        path = self.LOGO_PATH or _default_logo_path()
        if path and os.path.isfile(path):
            with open(path, "rb") as fh:
                b64 = base64.b64encode(fh.read()).decode()
            return f'<img class="logo" src="data:image/png;base64,{b64}" alt="Fincheck">'
        return '<span class="logo-fallback">FINCHECK</span>'

    def _risk_level(self, rating) -> tuple[int, str]:
        if rating is None or str(rating).strip() == "":
            return -1, "N/A"
        try:
            val = float(str(rating))
        except ValueError:
            return -1, str(rating).upper()
        if val <= 100:
            return 0, "SAFE"
        if val <= 220:
            return 1, "MEDIUM"
        if val <= 500:
            return 2, "HIGH"
        return 3, "VERY HIGH"

    def _risk_badge(self, rating) -> tuple[str, str]:
        idx, label = self._risk_level(rating)
        if idx < 0:
            return label, "badge-muted"
        text = str(rating).upper()
        cls_map = ["badge-ok", "badge-warn", "badge-fail", "badge-fail"]
        return text, cls_map[idx]

    def _css(self) -> str:
        c = self
        return f"""
@page {{
  size: A4;
  margin: 14mm 14mm 18mm 14mm;
  @bottom-center {{
    content: "CONFIDENTIAL — FOR AUTHORISED USE ONLY";
    font-size: 7pt;
    color: {c.MUTED};
    letter-spacing: .5px;
  }}
  @bottom-right {{
    content: "Page " counter(page);
    font-size: 7.5pt;
    color: {c.MUTED};
    }}
}}

* {{ box-sizing: border-box; margin: 0; padding: 0; }}

body {{
  font-family: "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 9pt;
  color: {c.TEXT};
  line-height: 1.55;
  background: #ffffff;
}}

.report {{
  display: block;
}}
.report > * {{
  margin-bottom: 22px;
}}
.report > *:last-child {{
  margin-bottom: 0;
}}

/* ── Header ── */
.header-section {{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}}
.header-logo-wrap {{
  width: 100%;
  text-align: center;
}}
.header-card {{
  width: 100%;
  border: 1px solid {c.BORDER};
  border-radius: 8px;
  padding: 20px 24px;
  background: #ffffff;
}}
.header-row {{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
}}
.header-col-left {{
  flex: 1 1 55%;
  min-width: 0;
}}
.header-col-right {{
  flex: 0 0 auto;
  max-width: 42%;
  text-align: right;
}}
.header-username,
.header-ref,
.header-client {{
  font-size: 8.5pt;
  color: {c.MUTED};
  line-height: 1.85;
}}
.header-username {{white-space: nowrap;}}
.header-ref {{ white-space: nowrap; }}
.header-client {{ overflow-wrap: anywhere; }}
.logo {{ height: 52px; display: inline-block; vertical-align: middle; }}
.logo-fallback {{
  font-size: 22pt;
  font-weight: 800;
  color: {c.PRIMARY};
  letter-spacing: -0.5px;
}}
.header-name {{
  font-size: 17pt;
  font-weight: 800;
  color: {c.PRIMARY};
  letter-spacing: .3px;
  line-height: 1.25;
  margin-bottom: 8px;
}}
.header-date {{
  font-size: 9pt;
  color: {c.MUTED};
}}
.header-meta b, .header-ref b, .header-client b, .header-username b {{ color: {c.PRIMARY}; }}

/* ── Cards ── */
.card {{
  border: 1px solid {c.BORDER};
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}}
.card-title {{
  background: {c.PRIMARY};
  color: #ffffff;
  padding: 11px 20px;
  font-size: 8.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  text-align: center;
}}
.card-body {{ padding: 0; }}

/* ── Summary card ── */
.summary-head {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid {c.BORDER};
}}
.summary-head h3 {{
  font-size: 10pt;
  font-weight: 700;
  color: {c.PRIMARY};
  text-transform: uppercase;
  letter-spacing: .4px;
}}
.summary-metrics {{
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid {c.BORDER};
  table-layout: fixed;
}}
.summary-metrics td {{
  width: 25%;
  padding: 16px 12px;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid {c.BORDER};
  border-bottom: 1px solid {c.BORDER};
}}
.summary-metrics tr:last-child td {{ border-bottom: none; }}
.summary-metrics td:last-child {{ border-right: none; }}
.metric-lbl {{
  font-size: 6.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: {c.MUTED};
  margin-bottom: 8px;
}}
.metric-val {{
  font-size: 13pt;
  font-weight: 800;
  color: {c.PRIMARY};
}}
.summary-comment {{
  padding: 18px 24px;
  background: {c.TINT};
  font-size: 9pt;
  color: {c.PRIMARY};
  line-height: 1.65;
  border-top: 1px solid {c.BORDER};
}}
.summary-comment strong {{
  display: block;
  margin-bottom: 6px;
  font-size: 8pt;
  letter-spacing: .4px;
}}

/* ── Risk ── */
.risk-section {{ padding: 20px 24px 24px; }}
.risk-row {{
  display: flex;
  justify-content: space-between;
  align-items: center;
}}
.risk-row h4 {{
  font-size: 9.5pt;
  font-weight: 700;
  color: {c.PRIMARY};
  text-transform: uppercase;
  letter-spacing: .3px;
}}

/* ── Grid table (4-col) ── */
.grid-table {{ width: 100%; border-collapse: collapse; }}
.grid-table tr {{ border-bottom: 1px solid #F1F5F9; break-inside: avoid; }}
.grid-table tr:last-child {{ border-bottom: none; }}
.grid-table td {{
  padding: 13px 20px;
  vertical-align: top;
}}
.grid-table .lbl {{
  width: 18%;
  font-weight: 600;
  color: {c.MUTED};
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: .3px;
}}
.grid-table .val {{
  width: 32%;
  font-size: 9pt;
  color: {c.TEXT};
  font-weight: 500;
  text-transform: uppercase;
}}

/* ── Data tables ── */
.data-table {{ width: 100%; border-collapse: collapse; }}
.data-table thead tr {{ background: {c.ACCENT}; break-inside: avoid; }}
.data-table th {{
  color: #ffffff;
  padding: 8px 10px;
  font-size: 7pt;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .4px;
}}
.data-table tbody tr {{ border-bottom: 1px solid #F1F5F9; break-inside: avoid; }}
.data-table tbody tr:last-child {{ border-bottom: none; }}
.data-table tbody tr:nth-child(even) {{ background: {c.ROW}; }}
.data-table td {{
  padding: 8px 10px;
  font-size: 8pt;
  vertical-align: middle;
  color: {c.TEXT};
  font-weight: 400;
  text-transform: uppercase;
  overflow-wrap: break-word;
  word-wrap: break-word;
}}
.ta-r {{ text-align: right; }}
.ta-c {{ text-align: center; }}
.nowrap {{ white-space: nowrap; }}

/* ── Badges ── */
.badge {{
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 7.5pt;
  font-weight: 700;
  letter-spacing: .3px;
  white-space: nowrap;
  text-transform: uppercase;
}}
.badge-ok {{ background: #DCFCE7; color: {c.GREEN}; }}
.badge-fail {{ background: #FEE2E2; color: {c.RED}; }}
.badge-warn {{ background: #FEF3C7; color: {c.AMBER}; }}
.badge-muted {{ background: #E2E8F0; color: #475569; }}

/* ── Directors ── */
.dir-grid {{
  display: grid;
  grid-template-columns: 1fr 1fr;
}}
.dir-card {{
  padding: 18px 20px;
  border-right: 1px solid {c.BORDER};
  border-bottom: 1px solid {c.BORDER};
}}
.dir-card:nth-child(even) {{ border-right: none; }}
.dir-card:last-child {{ border-bottom: none; }}
.dir-card:nth-last-child(2):nth-child(odd) {{ border-bottom: none; }}

/* ── Bankers ── */
.bank-grid {{
  display: grid;
  grid-template-columns: 1fr 1fr;
}}
.bank-card {{
  padding: 18px 20px;
  border-right: 1px solid {c.BORDER};
  border-bottom: 1px solid {c.BORDER};
}}
.bank-card:nth-child(even) {{ border-right: none; }}
.bank-card:last-child {{ border-bottom: none; }}
.bank-card:nth-last-child(2):nth-child(odd) {{ border-bottom: none; }}
.dir-name {{
  font-size: 10pt;
  font-weight: 800;
  color: {c.PRIMARY};
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid {c.TINT};
}}
.dir-pos {{ font-weight: 500; font-size: 8.5pt; color: {c.ACCENT}; }}
.dir-row {{ display: flex; margin-bottom: 5px; align-items: baseline; gap: 8px; }}
.dir-l {{
  font-size: 7pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .3px;
  color: {c.MUTED};
  min-width: 80px;
  flex-shrink: 0;
}}
.dir-v {{
  font-size: 8.5pt;
  font-weight: 500;
  color: {c.TEXT};
  text-transform: uppercase;
  overflow-wrap: break-word;
  word-wrap: break-word;
  min-width: 0;
}}

/* ── Credit sub-sections ── */
.cr-sub {{ padding: 16px 20px 12px; border-top: 1px solid {c.BORDER}; }}
.cr-sub:first-child {{ border-top: none; }}
.cr-title {{
  font-size: 8pt;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: {c.ACCENT};
  margin-bottom: 10px;
}}

/* ── Misc ── */
.empty {{
  padding: 20px;
  text-align: center;
  color: {c.MUTED};
  font-size: 9pt;
  text-transform: uppercase;
  letter-spacing: .3px;
}}
.fin-note {{
  padding: 12px 20px;
  background: {c.TINT};
  font-size: 8.5pt;
  font-weight: 600;
  color: {c.ACCENT};
  border-top: 1px solid {c.BORDER};
}}
.watermark {{
  position: fixed;
  top: 42%; left: 50%;
  transform: translate(-50%, -50%) rotate(-28deg);
  font-size: 72pt;
  font-weight: 900;
  color: rgba(5, 28, 44, 0.04);
  white-space: nowrap;
  z-index: -1;
}}
.footer {{
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid {c.BORDER};
  font-size: 8pt;
  color: {c.MUTED};
  line-height: 1.85;
}}
.footer p {{ margin-bottom: 12px; }}
.footer .rk span {{ margin-right: 14px; }}
        """

    # ── Sections ──────────────────────────────────────────────────────────────

    def _subject_name(self) -> str:
        if self._subject_type == "company":
            return self._m(self._subject.get("registered_name") or self._subject.get("company_name", ""))
        return self._m(self._subject.get("full_name", ""))

    def _client_name(self) -> str:
        return self._m(
            self._client.get("registered_name")
            or self._client.get("full_name")
            or self._client.get("company_name", "")
        )

    def _username(self)-> str:
        return self._m(
            self._report.username
        )

    def _render_header(self) -> str:
        if self._report is not None:
            ref = self._e(self._report.enquiry_reference)
            created = self._date(self._report.created_at)
            fin = self._report.finalized_at
        else:
            ref = self._e(self._snapshot.get("enquiry_reference"))
            created = self._date(self._snapshot.get("created_at"))
            fin = self._snapshot.get("finalized_at")
        dlbl = "DATE PRINTED" if fin else "REPORT GENERATED ON"
        dval = self._date(fin) if fin else created
        wm = '<div class="watermark">DRAFT</div>' if self._status == "draft" else ""
        subject_name = self._subject_name()

        return f"""{wm}
        <div class="header-section">
          <div class="header-logo-wrap">{self._logo_tag()}</div>
          <div class="header-card">
            <div class="header-row">
              <div class="header-col-left">
                <div class="header-name">{subject_name}</div>
                <div class="header-date">{dlbl} — {dval}</div>
              </div>
              <div class="header-col-right">
                <div class="header-ref">ENQUIRY REF: <b>{ref}</b></div>
                <div class="header-client">CLIENT: <b>{self._client_name()}</b></div>
                <div class="header-client">REQUESTOR: <b>{self._username()}</b></div>
              
              </div>
            </div>
          </div>
        </div>"""

    def _render_summary(self) -> str:
        rating = self._overall_risk_rating
        if self._report is not None:
            comment = self._report.summary or ""
        else:
            comment = self._snapshot.get("summary") or ""
        claims = self._subject.get("claims", [])
        absconders = self._subject.get("absconders", [])
        court = self._subject.get("court_judgements", [])
        insolvency = self._subject.get("insolvency_records", [])
        directors = self._subject.get("directors", [])
        banks = self._subject.get("banker_accounts", [])

        codes = ", ".join(b["bank_code"] for b in banks if b.get("bank_code")) or "—"

        reg_years = "—"
        if self._subject_type == "company":
            rd = self._subject.get("date_of_incorporation")
            if rd:
                try:
                    reg_years = str((date.today() - datetime.fromisoformat(str(rd)).date()).days // 365)
                except (ValueError, TypeError):
                    pass

        score_val = str(rating) if rating is not None else "N/A"
        rating_html = f'<span style="font-size: 13pt; font-weight: 800; color: {self.PRIMARY};">{html.escape(score_val)}</span>'

        def metric_cell(label: str, value: str, val_style: str = "") -> str:
            style_attr = f' style="{val_style}"' if val_style else ""
            return f"""<td>
              <div class="metric-lbl">{label}</div>
              <div class="metric-val"{style_attr}>{value}</div>
            </td>"""

        metrics = f"""
        <table class="summary-metrics">
          <tr>
            {metric_cell("Credit Defaults", str(len(claims) + len(absconders)))}
            {metric_cell("Insolvencies", str(len(insolvency)))}
            {metric_cell("Bank Code(s)", html.escape(codes.upper()), "font-size:8.5pt")}
          </tr>
          <tr>
            {metric_cell("Directors", str(len(directors)))}
            {metric_cell("Court Judgements", str(len(court)))}
            {metric_cell("Years Incorporated", reg_years)}
          </tr>
        </table>"""

        risk_block = f"""
        <div class="risk-section">
          <div class="risk-row">
            <h4>Overall Risk Classification</h4>
            {rating_html}
          </div>
        </div>"""

        if comment and str(comment).strip():
            comment_html = self._u(comment)
        else:
            comment_html = '<span style="color:#94A3B8">NO SUMMARY PROVIDED.</span>'

        comment_block = f"""
        <div class="summary-comment">
          <strong>SUMMARY COMMENT</strong>
          {comment_html}
        </div>"""

        body = f"""
        {risk_block}
        {metrics}
        {comment_block}"""

        return f"""
        <div class="card">
          <div class="card-body">{body}</div>
        </div>"""

    def _render_company_details(self) -> str:
        s = self._subject
        verified = {
            "Registered Name": " " + self._badge(bool(s.get("is_company_verified"))) if s.get("is_company_verified") is not None else "",
            "Address (Registered)": " " + self._badge(bool(s.get("is_address_registered_verified"))) if s.get("is_address_registered_verified") is not None else "",
        }
        rows = [
            ("Registered Name", self._m(s.get("registered_name"))),
            ("Trading Name", self._m(s.get("trading_name"))),
            ("Re-Registration Number", self._m(s.get("re_registration_number"))),
            ("Registration Number", self._m(s.get("registration_number"))),
            ("Registration Date", self._date((s.get("date_of_registration")))),
            ("Date of Incorporation", self._date((s.get("date_of_incorporation")))),
        ]
        return self._card("Company Details", self._grid_table(rows, verified))

    def _render_company_contact(self) -> str:
        s = self._subject
        rows = [
            ("Address (Registered)", self._m(s.get("address_registered")), True),
            ("Address (Operations)", self._m(s.get("address_operations")), True),
            ("Telephone", self._e(s.get("telephone_number")), True),
            ("Mobile", self._e(s.get("mobile_number")), True),
            ("Email", self._low(s.get("email")), True),
            ("Website", self._low(s.get("website")), True),
        ]
        return self._card("Contact Details", self._grid_table(rows))

    def _render_company_overview(self) -> str:
        ov = self._subject.get("overview") or {}
        rows = [
            ("Legal Form", self._label(self._e(ov.get("legal_form")))),
            ("Trading Status", self._e(ov.get("trading_status"))),
            ("Number of Employees", self._e(ov.get("number_of_employees"))),
            ("", ""),
        ]
        return self._card("Company Overview", self._grid_table(rows))

    def _render_directors(self) -> str:
        dirs = self._subject.get("directors") or []
        if not dirs:
            return ""

        cards = ""
        for d in dirs:
            # Support both nested individual_detail and flat structure
            ind = d.get("individual_detail") or d

            solvencies = self._u(ind.get("insolvencies_judgements")) if ind.get("insolvencies_judgements") else "CLEAR TO DATE IN THE NAME OF THE BUSINESS PRINCIPALS"

            # Support both old and new field names
            full_name = ind.get("full_name") or d.get("full_name", "")
            national_id = ind.get("national_id") or d.get("national_id")
            gender = ind.get("gender") or d.get("gender", "")
            dob = ind.get("date_of_birth") or ind.get("dob") or d.get("dob")
            is_pep = ind.get("is_pep") if ind.get("is_pep") is not None else d.get("is_pep")
            address_latest = ind.get("residential_address") or ind.get("address_latest") or d.get("address_latest")
            address_prev = ind.get("address_prev") or d.get("address_prev")
            email = ind.get("email") or d.get("email")
            mobile = ind.get("mobile_number") or ind.get("mobile_phone_number") or d.get("mobile_phone_number")

            dir_rows = [
                ("National ID", self._e(national_id)),
                ("Gender", self._label(gender)),
                ("Date of Birth", self._date(dob)),
                ("PEP", "YES" if is_pep else "NO"),
                ("Address (Latest)", self._m(address_latest)),
                ("Address (Previous)", self._m(address_prev)),
                ("Email", self._low(email)),
                ("Mobile", self._e(mobile)),
            ]
            
            rows_html = ""
            for lbl, val in dir_rows:
                if val is not None:
                    val_str = str(val).strip()
                    if val_str and val_str not in ("-", "—"):
                        rows_html += f'<div class="dir-row"><span class="dir-l">{lbl}</span><span class="dir-v">{val}</span></div>\n              '

            position = d.get("position", "")

            cards += f"""
            <div class="dir-card">
              <div class="dir-name">
                {self._u(full_name)}
                <span class="dir-pos"> — {self._label(position)}</span>
              </div>
              {rows_html.strip()}
              <div class="dir-v" style="margin-top: 10px; display: block; border-top: 1px dashed #E2E8F0; padding-top: 10px;">{solvencies}</div>
            </div>"""

        grid_cols = "1fr" if len(dirs) == 1 else "1fr 1fr"
        return self._card("Directors", f'<div class="dir-grid" style="grid-template-columns: {grid_cols}">{cards}</div>')

    def _render_shareholding(self) -> str:
        sh = self._subject.get("shareholdings") or {}
        shs = sh.get("shareholders") or []

        totals = self._grid_table([
            ("Authorised Capital", self._e(sh.get("authorized_capital"))),
            ("Issued Share Capital", self._e(sh.get("issued_share_capital"))),
            ("Shareholders", self._e(sh.get("numbers_of_shareholders"))),
        ])

        tbl = ""
        if shs:
            rows_html = "".join(f"""
            <tr>
              <td>{self._u(s.get("full_name"))}</td>
              <td>{self._m(s.get("address"))}</td>
              <td class="ta-r">{self._e(s.get("number_of_shares"))}</td>
              <td class="ta-r">{self._e(s.get("percentage_ownership"))}%</td>
              <td class="ta-r">{"YES" if s.get("is_pep") else "NO"}</td>
            </tr>""" for s in shs)
            tbl = self._data_table(["Name", "Address", "No. of Shares", "% Ownership", "PEP"], rows_html)

        body = totals + tbl
        if not body or not body.strip():
            return ""
        return self._card("Shareholding", body)

    def _render_structure(self) -> str:
        st = self._subject.get("structure") or {}
        rows = [
            ("Holding Company", self._u(st.get("holding_company"))),
            ("Subsidiaries", self._u(st.get("subsidiaries"))),
            ("Associated Companies", self._u(st.get("associated_companies"))),
            ("Divisions", self._u(st.get("divisions"))),
            ("Branches", self._u(st.get("branches"))),
            ("", ""),
        ]
        return self._card("Company Structure", self._grid_table(rows))

    def _render_operations(self) -> str:
        op = self._subject.get("operations") or {}
        rows = [
            ("Industry", self._u(op.get("industry")), True),
            ("Target Markets", self._u(op.get("target_markets")), True),
            ("Operations Territories", self._u(op.get("operations_territories"))),
            ("Property Ownership", self._u(op.get("property_ownership"))),
            ("Operational Areas", self._u(op.get("operational_areas"))),
            ("Import / Export", self._u(op.get("import_export"))),
            ("Purchase Payment Terms", self._u((op.get("purchases_payment_terms") or "").replace("_", " "))),
            ("Purchase Supplier Scope", self._u((op.get("purchase_supplier_scope") or "").replace("_", " "))),
            ("Sales Payment Terms", self._u((op.get("sales_payment_terms") or "").replace("_", " "))),
            ("", "")
        ]
        return self._card("Operations", self._grid_table(rows))
    
    def _render_individual_details(self) -> str:
        s = self._subject
        rows = [
            ("Full Name", self._u(s.get("full_name"))),
            ("National ID", self._e(s.get("national_id"))),
            ("Date of Birth", self._date(s.get("date_of_birth"))),
            ("Gender", self._label(s.get("gender", ""))),
            ("Marital Status", self._label(s.get("marital_status", ""))),
            ("Nationality", self._u(s.get("nationality"))),
            ("Refer Type", self._u(s.get("refer_type"))),
            ("", ""),
        ]
        return self._card("Individual Details", self._grid_table(rows))

    def _render_individual_contact(self) -> str:
        s = self._subject
        rows = [
            ("Mobile Number", self._e(s.get("mobile_number"))),
            ("Email", self._low(s.get("email"))),
            ("Residential Address", self._m(s.get("residential_address"))),
            ("", "—"),
        ]
        return self._card("Contact Details", self._grid_table(rows))

    def _render_employment(self) -> str:
        emp = self._subject.get("employment_information") or {}
        rows = [
            ("Employer", self._u(emp.get("employer"))),
            ("Position", self._u(emp.get("position"))),
            ("Employment Status", self._label(emp.get("employment_status", ""))),
            ("Years Employed", self._e(emp.get("years_employed"))),
            ("Monthly Income", self._money(emp.get("monthly_income"))),
            ("Previous Employer", self._u(emp.get("previous_employer"))),
        ]
        return self._card("Employment Information", self._grid_table(rows))

    def _render_next_of_kin(self) -> str:
        nok = self._subject.get("next_of_kin") or {}
        rows = [
            ("Name", self._u(nok.get("name"))),
            ("Relationship", self._u(nok.get("relationship"))),
            ("Contact Number", self._e(nok.get("contact_number"))),
            ("", "—"),
        ]
        return self._card("Next of Kin", self._grid_table(rows))

    def _render_credit_records(self) -> str:
        def claims_html() -> str:
            recs = self._subject.get("claims") or []
            if not recs:
                return ""
            rows = "".join(f"""<tr>
              <td>{self._u(c.get("creditor_name"))}</td>
              <td>{self._e(c.get("account_number"))}</td>
              <td>{self._e(c.get("currency"))}</td>
              <td class="ta-r">{self._money(c.get("amount"))}</td>
              <td class="ta-r">{self._money(c.get("overdue_balance"))}</td>
              <td class="nowrap">{self._date(c.get("claim_date"))}</td>
              <td class="ta-c">{self._status_badge(c.get("status", "open"))}</td>
            </tr>""" for c in recs)
            return self._data_table(
                ["Creditor", "A/C No.", "Currency", "Amount", "Overdue", "Claim Date", "Status"],
                rows)

        def absconders_html() -> str:
            recs = self._subject.get("absconders") or []
            if not recs:
                return ""
            rows = "".join(f"""<tr>
              <td>{self._u(a.get("creditor_name"))}</td>
              <td>{self._m(a.get("account_number"))}</td>
              <td>{self._e(a.get("currency"))}</td>
              <td class="ta-r">{self._money(a.get("amount"))}</td>
              <td class="ta-r">{self._money(a.get("overdue_balance"))}</td>
              <td class="nowrap">{self._date(a.get("start_date"))}</td>
              <td class="ta-c">{self._status_badge(a.get("status", "open"))}</td>
            </tr>""" for a in recs)
            return self._data_table(
                ["Creditor", "A/C No.", "Currency", "Amount", "Overdue", "Start Date", "Status"],
                rows)

        def court_html() -> str:
            recs = self._subject.get("court_judgements") or []
            if not recs:
                return ""
            rows = "".join(f"""<tr>
              <td>{self._u(c.get("court_name"))}</td>
              <td>{self._m(c.get("case_number"))}</td>
              <td>{self._u(c.get("plaintf_name"))}</td>
              <td>{self._e(c.get("currency"))}</td>
              <td class="ta-r">{self._money(c.get("amount"))}</td>
              <td class="nowrap">{self._date(c.get("judgement_date"))}</td>
              <td class="ta-c">{self._status_badge(c.get("status", "open"))}</td>
            </tr>""" for c in recs)
            return self._data_table(
                ["Court", "Case No.", "Plaintiff", "Currency", "Amount", "Judgement Date", "Status"],
                rows)

        def insolvency_html() -> str:
            recs = self._subject.get("insolvency_records") or []
            if not recs:
                return ""
            rows = "".join(f"""<tr>
              <td>{self._label(i.get("insolvency_type", ""))}</td>
              <td>{self._e(i.get("court_reference"))}</td>
              <td class="nowrap">{self._date(i.get("start_date"))}</td>
              <td class="nowrap">{self._date(i.get("end_date"))}</td>
            </tr>""" for i in recs)
            return self._data_table(
                ["Type", "Court Reference", "Start Date", "End Date"],
                rows)

        def public_html() -> str:
            recs = self._subject.get("public_information") or []
            if not recs:
                return ""
            rows = "".join(f"""<tr>
              <td class="nowrap">{self._date(p.get("record_date"))}</td>
              <td>{self._u(p.get("summary"))}</td>
              <td style="font-size:8pt;text-transform:none">{self._e(p.get("link"))}</td>
            </tr>""" for p in recs)
            return self._data_table(
                ["Record Date", "Summary", "Link"],
                rows)

        parts = []
        c_html = claims_html()
        if c_html: parts.append(f'<div class="cr-sub"><div class="cr-title">Claims</div>{c_html}</div>')
        a_html = absconders_html()
        if a_html: parts.append(f'<div class="cr-sub"><div class="cr-title">Absconders</div>{a_html}</div>')
        co_html = court_html()
        if co_html: parts.append(f'<div class="cr-sub"><div class="cr-title">Court Judgements</div>{co_html}</div>')
        i_html = insolvency_html()
        if i_html: parts.append(f'<div class="cr-sub"><div class="cr-title">Insolvency / Judicial Management</div>{i_html}</div>')
        p_html = public_html()
        if p_html: parts.append(f'<div class="cr-sub"><div class="cr-title">Public Information</div>{p_html}</div>')

        return self._card("Credit Records", "".join(parts))

    def _render_trade_references(self) -> str:
        refs = self._subject.get("trade_references") or []
        if not refs:
            return ""
        rows = "".join(f"""<tr>
          <td class="nowrap">{self._date(r.get("referenced_date"))}</td>
          <td>{self._u(r.get("name"))}</td>
          <td>{self._e(r.get("contact_info"))}</td>
          <td>{self._u(r.get("reference_source"))}</td>
          <td>{self._u(r.get("position"))}</td>
          <td class="ta-r">{self._e(r.get("credit_limit"))}</td>
          <td class="ta-r">{self._e(r.get("credit_terms"))}</td>
          <td>{self._label(r.get("payment_trend", "") or r.get("payment_trend_display", ""))}</td>
        </tr>""" for r in refs)
        body = self._data_table(
            ["Ref. Date", "Name", "Contact", "Source", "Position", "Credit Limit", "Credit Terms", "Pay Trend"],
            rows)
        return self._card("Trade References", body)

    def _render_financials(self) -> str:
        fin = self._subject.get("financials") or {}
        has_file = bool(fin.get("files"))
        rows = [
            ("Financial Year", self._e(fin.get("financial_year"))),
            ("Total Assets", self._money(fin.get("total_assets"))),
            ("Total Revenue", self._money(fin.get("total_revenue"))),
            ("Net Profit", self._money(fin.get("net_profit"))),
            ("Net Worth", self._money(fin.get("net_worth"))),
            ("Paid-up Capital", self._money(fin.get("paid_up_capital"))),
            ("Authorised Capital", self._money(fin.get("authorized_capital"))),
            ("", ""),
        ]
        note = '<div class="fin-note">FINANCIAL STATEMENTS ATTACHED ON FOLLOWING PAGE(S)</div>' if has_file else ""
        return self._card("Financials", self._grid_table(rows) + note)

    def _render_registrations(self) -> str:
        reg = self._subject.get("registration_accounts") or {}
        verified = {
            "TIN Number": " " + self._badge(bool(reg.get("is_tin_verified"))) if reg.get("is_tin_verified") is not None else "",
            "VAT Number": " " + self._badge(bool(reg.get("is_vat_verified"))) if reg.get("is_vat_verified") is not None else "",
            "NSSA Number": " " + self._badge(bool(reg.get("is_nssa_verified"))) if reg.get("is_nssa_verified") is not None else "",
            "PRAZ Number": " " + self._badge(bool(reg.get("is_praz_verified"))) if reg.get("is_praz_verified") is not None else "",
            "Tax Clearance Expiration Date": " " + self._badge(bool(reg.get("is_tax_clearance_expiration_date"))) if reg.get("is_tax_clearance_expiration_date") is not None else "",
        }
        rows = [
            ("TIN Number", self._e(reg.get("tin_number"))),
            ("VAT Number", self._e(reg.get("vat_number"))),
            ("NSSA Number", self._e(reg.get("nssa_number"))),
            ("PRAZ Number", self._e(reg.get("praz_number"))),
            ("Tax Clearance Expiration Date", self._date(reg.get("tax_clearance_expiration_date"))),
        ]
        return self._card("Registrations", self._grid_table(rows, verified))

    def _render_bankers(self) -> str:
        banks = self._subject.get("banker_accounts") or []
        if not banks:
            return ""

        cards = ""
        for b in banks:
            narration_raw = b.get("narration_display")
            narration = None if narration_raw and str(narration_raw).strip().lower() == "none" else narration_raw
            
            bank_rows = [
                ("Account Name", self._m(b.get("account_name"))),
                ("Type", self._label(b.get("account_type", ""))),
                ("Code", self._e(b.get("bank_code"))),
                ("Narration", self._e(narration)),
                ("Date Acquired", self._date(b.get("date_of_acquirement"))),
                ("Account No.", self._e(b.get("account_number"))),
            ]
            
            rows_html = ""
            for lbl, val in bank_rows:
                if val is not None:
                    val_str = str(val).strip()
                    if val_str and val_str not in ("-", "—"):
                        rows_html += f'<div class="dir-row"><span class="dir-l">{lbl}</span><span class="dir-v">{val}</span></div>\n              '

            bank_name = self._u(b.get("bank"))
            branch = self._label(b.get("branch", ""))
            branch_html = f'<span class="dir-pos"> — {branch}</span>' if branch and branch != "—" else ""

            cards += f"""
            <div class="bank-card">
              <div class="dir-name">
                {bank_name}
                {branch_html}
              </div>
              {rows_html.strip()}
            </div>"""

        return self._card("Bankers", f'<div class="bank-grid">{cards}</div>')

    def _render_professionals(self) -> str:
        pp = self._subject.get("professional_partners") or {}

        def fmt(raw: str) -> str:
            if not raw:
                return "—"
            return self._u(raw.replace(",", "\n"))

        rows = [
            ("Auditors", fmt(pp.get("auditors", ""))),
            ("Lawyers", fmt(pp.get("lawyers", ""))),
            ("", "—"),
            ("", "—"),
        ]
        return self._card("Professional Partners", self._grid_table(rows))

    @staticmethod
    def _render_footer() -> str:
        return """
        <div class="footer">
          <p>This report is confidential and intended solely for the individual or company to whom it is addressed. Information on this report is valid at the time of enquiry only.</p>
          <p>Terms and Conditions apply.</p>
          <p>© FINCHECK. All rights reserved.</p>
        </div>"""

    def _build_html(self) -> str:
        parts = [self._render_header(), self._render_summary()]

        if self._subject_type == "company":
            parts += [
                self._render_company_details(),
                self._render_company_contact(),
                self._render_company_overview(),
                self._render_directors(),
                self._render_shareholding(),
                self._render_structure(),
                self._render_operations(),
            ]
        else:
            parts += [
                self._render_individual_details(),
                self._render_individual_contact(),
                self._render_employment(),
                self._render_next_of_kin(),
            ]

        parts += [
            self._render_credit_records(),
            self._render_trade_references(),
            self._render_financials(),
            self._render_registrations(),
            self._render_bankers(),
            self._render_professionals(),
            self._render_footer(),
        ]

        ref = html.escape(str(self._enq_ref or "N/A"))
        return f"""
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>FINCHECK Business Credit Report — {ref}</title>
                    <style>{self._css()}</style>
                </head>
                <body>
                    <div class="report">
                        {"".join(parts)}
                        </div>
                    </body>
            </html>
        """

    # ── Financial attachment ──────────────────────────────────────────────────

    def _resolve_storage_names(self) -> list[tuple[str, str]]:
        fin = self._subject.get("financials") or {}
        files_data = fin.get("files") or []
        
        media_url = _media_url().rstrip("/")
        results = []
        for f_data in files_data:
            file_url = f_data.get("file")
            title = f_data.get("file_title") or "Financial Document"
            if not file_url:
                continue

            if file_url.startswith(("http://", "https://")):
                path = urlparse(file_url).path
            else:
                path = file_url

            rel = path[len(media_url):] if path.startswith(media_url) else path
            rel = rel.lstrip("/")

            if default_storage.exists(rel):
                results.append((rel, title))
                
        return results

    def _attachments_as_pdfs(self) -> list[bytes]:
        files_info = self._resolve_storage_names()
        pdfs = []
        for name, title in files_info:
            ext = os.path.splitext(name)[1].lower()
            try:
                if ext == ".pdf":
                    cover = weasyprint.HTML(string=f"""<!DOCTYPE html><html><head>
                        <style>@page{{size:A4;margin:20mm}}body{{font-family:Arial;text-align:center;padding-top:80mm;color:#374151}}</style>
                        </head><body><h2 style="color:#051C2C">{html.escape(title)}</h2>
                        </body></html>""").write_pdf()
                    with default_storage.open(name, "rb") as fh:
                        pdf_bytes = fh.read()
                        writer = PdfWriter()
                        for page in PdfReader(io.BytesIO(cover)).pages:
                            writer.add_page(page)
                        for page in PdfReader(io.BytesIO(pdf_bytes)).pages:
                            writer.add_page(page)
                        buf = io.BytesIO()
                        writer.write(buf)
                        pdfs.append(buf.getvalue())
                elif ext in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
                    pdfs.append(self._image_to_pdf(name, ext, title))
                elif ext in (".xlsx", ".xls"):
                    pdfs.append(self._excel_to_pdf(name, title))
            except Exception:
                pass
        return pdfs

    @staticmethod
    def _image_to_pdf(name: str, ext: str, title: str) -> bytes:
        mime = {
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".png": "image/png", ".gif": "image/gif",
            ".webp": "image/webp",
        }.get(ext, "image/jpeg")
        with default_storage.open(name, "rb") as fh:
            b64 = base64.b64encode(fh.read()).decode()
        src = f"data:{mime};base64,{b64}"
        return weasyprint.HTML(string=f"""<!DOCTYPE html><html><head>
    <style>@page{{size:A4;margin:10mm}}body{{margin:0;display:flex;flex-direction:column;align-items:center}}
    h2{{color:#051C2C;font-family:Arial;margin-top:10mm;margin-bottom:10mm}}
    img{{max-width:100%;max-height:230mm;object-fit:contain}}</style></head>
    <body><h2>{html.escape(title)}</h2><img src="{src}" alt="{html.escape(title)}"></body></html>""").write_pdf()

    @staticmethod
    def _excel_to_pdf(name: str, title: str) -> bytes:
        try:
            import openpyxl
            with default_storage.open(name, "rb") as fh:
                wb = openpyxl.load_workbook(fh, read_only=True, data_only=True)
            ws = wb.active
            hdr, body_rows = None, []
            for i, row in enumerate(ws.iter_rows(values_only=True)):
                cells = [html.escape(str(c)) if c is not None else "" for c in row]
                if i == 0:
                    hdr = cells
                else:
                    body_rows.append(cells)
            ths = "".join(f"<th>{c}</th>" for c in (hdr or []))
            trs = "".join(
                "<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>"
                for r in body_rows
            )
            return weasyprint.HTML(string=f"""<!DOCTYPE html><html><head>
    <style>@page{{size:A4 landscape;margin:10mm}}body{{font-family:Arial;font-size:8pt}}
    table{{border-collapse:collapse;width:100%}}th{{background:#051C2C;color:#fff;padding:5px 8px}}
    td{{border:1px solid #E2E8F0;padding:4px 8px}}tr:nth-child(even) td{{background:#F8FAFC}}</style>
    </head><body><h3 style="color:#051C2C;margin-bottom:8px">{html.escape(title)}</h3>
    <table><thead><tr>{ths}</tr></thead><tbody>{trs}</tbody></table></body></html>""").write_pdf()
        except ImportError:
            return weasyprint.HTML(string=f"""<!DOCTYPE html><html><head>
    <style>@page{{size:A4;margin:20mm}}body{{font-family:Arial;text-align:center;padding-top:80mm;color:#374151}}</style>
    </head><body><h2 style="color:#051C2C">{html.escape(title)}</h2>
    <p style="margin-top:10px">Excel file attached — please refer to the original spreadsheet.</p>
    </body></html>""").write_pdf()

    def _append_financial_attachment(self, main_pdf: bytes) -> bytes:
        attachments = self._attachments_as_pdfs()
        if not attachments:
            return main_pdf
        writer = PdfWriter()
        for page in PdfReader(io.BytesIO(main_pdf)).pages:
            writer.add_page(page)
        for attachment in attachments:
            for page in PdfReader(io.BytesIO(attachment)).pages:
                writer.add_page(page)
        buf = io.BytesIO()
        writer.write(buf)
        return buf.getvalue()