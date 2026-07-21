import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import type { EntityValue, Company, Individual, Claim, Absconder, CourtJudgement, InsolvencyRecord, PublicInformation, TradeReference, BankerAccount, Financial, RegistrationAccount, ProfessionalPartner, CompanyDirector, Shareholding, CompanyOverview, CompanyStructure, CompanyOperations, EmploymentInformation, NextOfKin } from "@/types/core";
import { Eye, Printer, Loader2, Paperclip, EyeOff } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef, useState } from "react"
import useGetSingleEntity from "@/hooks/api/useGetSingleEntity";
import { API_END_POINT } from "@/axios/api";

function _val(val: string | number | null | undefined, fallback = "—"): string {
  if (val === null || val === undefined || String(val).trim() === "") return fallback;
  return String(val);
}

function _upper(val: string | number | null | undefined, fallback = "—"): string {
  return _val(val, fallback).toUpperCase();
}

function _label(raw: string | null | undefined): string {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").toUpperCase();
}

function _date(val: string | null | undefined): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).toUpperCase();
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  } catch {
    return String(val).toUpperCase();
  }
}

function _money(amount: string | number | null | undefined, currency = ""): string {
  if (amount === null || amount === undefined) return "—";
  try {
    const prefix = currency ? `${currency} ` : "";
    return `${prefix}${parseFloat(String(amount)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } catch {
    return String(amount);
  }
}

function _badge(ok: boolean, okText = "VERIFIED", failText = "UNVERIFIED") {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[7.5pt] font-bold tracking-wide whitespace-nowrap uppercase ml-2 ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {ok ? okText : failText}
    </span>
  );
}

function _statusBadge(status: string) {
  const s = (status || "open").toLowerCase();
  const cls = {
    open: "bg-amber-100 text-amber-700",
    settled: "bg-green-100 text-green-700",
    closed: "bg-gray-200 text-gray-600",
    disputed: "bg-red-100 text-red-700",
    written_off: "bg-gray-200 text-gray-600",
  }[s] || "bg-gray-200 text-gray-600";
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[7.5pt] font-bold tracking-wide uppercase ${cls}`}>{s.toUpperCase()}</span>;
}


function resolveFileUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
  // Relative URL - prepend API endpoint
  return `${API_END_POINT}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

function isImageFile(url: string): boolean {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
}

function isPdfFile(url: string): boolean {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
  return ext === "pdf";
}


// ── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-5 break-inside-avoid">
      <div className="bg-[#051C2C] text-white py-2.5 px-5 text-[8.5pt] font-bold uppercase tracking-wider text-center">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function GridRow({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  if (!label) return null;
  const valStr = String(value).trim();
  if (!valStr || valStr === "-" || valStr === "—") return null;
  return (
    <div className="flex border-b border-gray-100 last:border-b-0">
      <div className="w-[35%] py-3 px-5 font-semibold text-gray-500 text-[8pt] uppercase tracking-wide">{label}</div>
      <div className="w-[65%] py-3 px-5 text-[9pt] text-gray-900 font-semibold uppercase">
        {value}
        {extra}
      </div>
    </div>
  );
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-[#1E5474]">
            {headers.map((h, i) => (
              <th key={i} className="text-white py-2.5 px-4 text-[7.5pt] font-bold uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[8.5pt] font-medium uppercase text-gray-900">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// ── Company-specific sections ────────────────────────────────────────────────

function CompanyDetailsSection({ data }: { data: Company }) {
  const ops = data.operations as CompanyOperations | null;
  return (
    <SectionCard title="Company Details">
      <GridRow label="Registered Name" value={_upper(data.registered_name)} extra={data.is_verified !== undefined ? _badge(!!data.is_verified) : undefined} />
      <GridRow label="Trading Name" value={_upper(data.trading_name)} />
      <GridRow label="Registration Number" value={_upper(data.registration_number)} />
      <GridRow label="Date Registered" value={_date(data.date_of_registration)} />
      <GridRow label="Industry Sector" value={_upper(ops?.industry)} />
    </SectionCard>
  );
}

function CompanyContactSection({ data }: { data: Company }) {
  return (
    <SectionCard title="Contact Details">
      <GridRow label="Telephone" value={_val(data.telephone_number)} />
      <GridRow label="Mobile" value={_val(data.mobile_number)} />
      <GridRow label="Email" value={_val(data.email)} />
      <GridRow label="Website" value={_val(data.website)} />
      <GridRow label="Address (Registered)" value={_upper(data.address_registered)} extra={data.is_address_registered_verified !== undefined ? _badge(!!data.is_address_registered_verified) : undefined} />
      <GridRow label="Address (Operations)" value={_upper(data.address_operations)} />
    </SectionCard>
  );
}

function CompanyOverviewSection({ data }: { data: CompanyOverview }) {
  return (
    <SectionCard title="Company Overview">
      <GridRow label="Legal Form" value={_label(data.legal_form)} />
      <GridRow label="Trading Status" value={_label(data?.trading_status)} />
      <GridRow label="Number of Employees" value={_val(data.number_of_employees)} />
    </SectionCard>
  );
}

function DirectorsSection({ directors }: { directors: CompanyDirector[] }) {
  if (!directors || directors.length === 0) return null;
  return (
    <SectionCard title="Directors">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {directors.map((d) => (
          <div key={d.id} className="p-4 border-b border-r border-gray-200 last:border-b-0">
            <div className="text-[10pt] font-extrabold text-[#051C2C] mb-2 pb-2 border-b border-blue-50">
              {_upper(d.full_name)}
              <span className="font-medium text-[8.5pt] text-[#1E5474] ml-2">— {_label(d.position)}</span>
            </div>
            <div className="space-y-1">
              {[
                ["National ID", _val(d.national_id)],
                ["Gender", _label(d.gender)],
                ["Date of Birth", _date(d.dob)],
                ["PEP", d.is_pep ? "YES" : "NO"],
                ["Address (Latest)", _upper(d.address_latest)],
                ["Address (Previous)", _upper(d.address_prev)],
                ["Email", _val(d.email)],
                ["Mobile", _val(d.mobile_phone_number)],
                ["Insolvencies", d.insolvencies_judgements ? _upper(d.insolvencies_judgements) : "NONE RECORDED"],
              ].map(([lbl, val]) => {
                const v = String(val).trim();
                if (!v || v === "—") return null;
                return (
                  <div key={lbl} className="flex gap-2 items-baseline">
                    <span className="text-[7pt] font-bold uppercase tracking-wide text-gray-500 min-w-25 shrink-0">{lbl}</span>
                    <span className="text-[8.5pt] font-semibold text-gray-900 uppercase">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ShareholdingSection({ data }: { data: Shareholding }) {
  const shareholders = data?.shareholders || [];
  return (
    <SectionCard title="Shareholding">
      <GridRow label="Authorised Capital" value={_val(data.authorized_capital)} />
      <GridRow label="Issued Share Capital" value={_val(data.issued_share_capital)} />
      <GridRow label="Shareholders" value={_val(data.numbers_of_shareholders)} />
      {shareholders.length > 0 && (
        <DataTable headers={["Name", "Address", "No. of Shares", "% Ownership", "PEP"]}>
          {shareholders.map((s) => (
            <tr key={s.id} className="border-b border-gray-100 even:bg-gray-50">
              <td className="py-2.5 px-4">{_upper(s.full_name)}</td>
              <td className="py-2.5 px-4">{_upper(s.address)}</td>
              <td className="py-2.5 px-4">{_val(s.number_of_shares)}</td>
              <td className="py-2.5 px-4">{_val(s.percentage_ownership)}%</td>
              <td className="py-2.5 px-4">{s.is_pep ? "YES" : "NO"}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </SectionCard>
  );
}

function StructureSection({ data }: { data: CompanyStructure }) {
  return (
    <SectionCard title="Company Structure">
      <GridRow label="Holding Company" value={_upper(data.holding_company)} />
      <GridRow label="Subsidiaries" value={_upper(data.subsidiaries)} />
      <GridRow label="Associated Companies" value={_upper(data.associated_companies)} />
      <GridRow label="Divisions" value={_upper(data.divisions)} />
      <GridRow label="Branches" value={_upper(data.branches)} />
    </SectionCard>
  );
}

function OperationsSection({ data }: { data: CompanyOperations }) {
  return (
    <SectionCard title="Operations">
      <GridRow label="Industry" value={_upper(data.industry)} />
      <GridRow label="Target Markets" value={_upper(data.target_markets)} />
      <GridRow label="Operations Territories" value={_upper(data.operations_territories)} />
      <GridRow label="Property Ownership" value={_upper(data.property_ownership)} />
      <GridRow label="Operational Areas" value={_upper(data.operational_areas)} />
      <GridRow label="Import / Export" value={_upper(data.import_export)} />
      <GridRow label="Purchase Payment Terms" value={_label(data.purchases_payment_terms)} />
      <GridRow label="Purchase Supplier Scope" value={_label(data.purchase_supplier_scope)} />
      <GridRow label="Sales Payment Terms" value={_label(data.sales_payment_terms)} />
    </SectionCard>
  );
}

function IndividualDetailsSection({ data }: { data: Individual }) {
  return (
    <SectionCard title="Individual Details">
      <GridRow label="Full Name" value={_upper(data.full_name)} />
      <GridRow label="National ID" value={_val(data.national_id)} />
      <GridRow label="Date of Birth" value={_date(data.date_of_birth)} />
      <GridRow label="Gender" value={_label(data.gender)} />
      <GridRow label="Marital Status" value={_label(data.marital_status)} />
      <GridRow label="Nationality" value={_upper(data.nationality)} />
      <GridRow label="Refer Type" value={_upper(data.refer_type)} />
    </SectionCard>
  );
}

function IndividualContactSection({ data }: { data: Individual }) {
  return (
    <SectionCard title="Contact Details">
      <GridRow label="Mobile Number" value={_val(data.mobile_number)} />
      <GridRow label="Email" value={_val(data.email)} />
      <GridRow label="Residential Address" value={_upper(data.residential_address)} />
    </SectionCard>
  );
}

function EmploymentSection({ data }: { data: EmploymentInformation }) {
  return (
    <SectionCard title="Employment Information">
      <GridRow label="Employer" value={_upper(data.employer)} />
      <GridRow label="Position" value={_upper(data.position)} />
      <GridRow label="Employment Status" value={_label(data.employment_status)} />
      <GridRow label="Years Employed" value={_val(data.years_employed)} />
      <GridRow label="Monthly Income" value={_money(data.monthly_income)} />
      <GridRow label="Previous Employer" value={_upper(data.previous_employer)} />
    </SectionCard>
  );
}

function NextOfKinSection({ data }: { data: NextOfKin }) {
  return (
    <SectionCard title="Next of Kin">
      <GridRow label="Name" value={_upper(data.name)} />
      <GridRow label="Relationship" value={_upper(data.relationship)} />
      <GridRow label="Contact Number" value={_val(data.contact_number)} />
    </SectionCard>
  );
}


function CreditRecordsSection({ claims, absconders, courtJudgements, insolvencyRecords, publicInformation }: {
  claims: Claim[];
  absconders: Absconder[];
  courtJudgements: CourtJudgement[];
  insolvencyRecords: InsolvencyRecord[];
  publicInformation: PublicInformation[];
}) {
  const hasAnything = claims.length > 0 || absconders.length > 0 || courtJudgements.length > 0 || insolvencyRecords.length > 0 || publicInformation.length > 0;
  if (!hasAnything) return null;

  return (
    <SectionCard title="Credit Records">
      {/* Claims */}
      {claims.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-200 first:border-t-0">
          <div className="text-[8pt] font-extrabold uppercase tracking-wider text-[#1E5474] mb-2">Claims</div>
          <DataTable headers={["Creditor", "Debtor", "Currency", "Amount", "Claim Date", "Status"]}>
            {claims.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 even:bg-gray-50">
                <td className="py-2.5 px-4">{_upper(c.creditor_name)}</td>
                <td className="py-2.5 px-4">{_upper(c.debtor?.name)}</td>
                <td className="py-2.5 px-4">{_val(c.currency)}</td>
                <td className="py-2.5 px-4 text-right">{_money(c.amount)}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">{_date(c.claim_date)}</td>
                <td className="py-2.5 px-4 text-center">{_statusBadge(c.status)}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* Absconders */}
      {absconders.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-200">
          <div className="text-[8pt] font-extrabold uppercase tracking-wider text-[#1E5474] mb-2">Absconders</div>
          <DataTable headers={["Creditor", "Debtor", "Currency", "Amount", "Start Date", "Status"]}>
            {absconders.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 even:bg-gray-50">
                <td className="py-2.5 px-4">{_upper(a.creditor_name)}</td>
                <td className="py-2.5 px-4">{_upper(a.debtor?.name)}</td>
                <td className="py-2.5 px-4">{_val(a.currency)}</td>
                <td className="py-2.5 px-4 text-right">{_money(a.amount)}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">{_date(a.start_date)}</td>
                <td className="py-2.5 px-4 text-center">{_statusBadge(a.status)}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* Court Judgements */}
      {courtJudgements.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-200">
          <div className="text-[8pt] font-extrabold uppercase tracking-wider text-[#1E5474] mb-2">Court Judgements</div>
          <DataTable headers={["Court", "Case No.", "Currency", "Amount", "Judgement Date"]}>
            {courtJudgements.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 even:bg-gray-50">
                <td className="py-2.5 px-4">{_upper(c.court_name)}</td>
                <td className="py-2.5 px-4">{_val(c.case_number)}</td>
                <td className="py-2.5 px-4">{_val(c.currency)}</td>
                <td className="py-2.5 px-4 text-right">{_money(c.amount)}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">{_date(c.judgement_date)}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* Insolvency Records */}
      {insolvencyRecords.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-200">
          <div className="text-[8pt] font-extrabold uppercase tracking-wider text-[#1E5474] mb-2">Insolvency / Judicial Management</div>
          <DataTable headers={["Type", "Court Reference", "Start Date", "End Date"]}>
            {insolvencyRecords.map((i) => (
              <tr key={i.id} className="border-b border-gray-100 even:bg-gray-50">
                <td className="py-2.5 px-4">{_label(i.insolvency_type)}</td>
                <td className="py-2.5 px-4">{_val(i.court_reference)}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">{_date(i.start_date)}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">{_date(i.end_date)}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* Public Information */}
      {publicInformation.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-200">
          <div className="text-[8pt] font-extrabold uppercase tracking-wider text-[#1E5474] mb-2">Public Information</div>
          <DataTable headers={["Record Date", "Summary", "Link"]}>
            {publicInformation.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 even:bg-gray-50">
                <td className="py-2.5 px-4 whitespace-nowrap">{_date(p.record_date)}</td>
                <td className="py-2.5 px-4">{_upper(p.summary)}</td>
                <td className="py-2.5 px-4 text-[8pt] normal-case">{_val(p.link)}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}
    </SectionCard>
  );
}

function TradeReferencesSection({ refs }: { refs: TradeReference[] }) {
  if (!refs || refs.length === 0) return null;
  return (
    <SectionCard title="Trade References">
      <DataTable headers={["Ref. Date", "Name", "Contact", "Source", "Position", "Credit Limit", "Credit Terms", "Pay Trend"]}>
        {refs.map((r) => (
          <tr key={r.id} className="border-b border-gray-100 even:bg-gray-50">
            <td className="py-2.5 px-4 whitespace-nowrap">{_date(r.referenced_date)}</td>
            <td className="py-2.5 px-4">{_upper(r.name)}</td>
            <td className="py-2.5 px-4">{_val(r.contact_info)}</td>
            <td className="py-2.5 px-4">{_upper(r.reference_source)}</td>
            <td className="py-2.5 px-4">{_upper(r.position)}</td>
            <td className="py-2.5 px-4 text-right">{_val(r.credit_limit)}</td>
            <td className="py-2.5 px-4 text-right">{_val(r.credit_terms)}</td>
            <td className="py-2.5 px-4">{_label(r.payment_trend)}</td>
          </tr>
        ))}
      </DataTable>
    </SectionCard>
  );
}

function FinancialsSection({ data, showAttachment, onToggle }: { data: Financial; showAttachment: boolean; onToggle: () => void }) {
  const fileUrl = resolveFileUrl(data?.financials_file);
  const hasImage = fileUrl && isImageFile(fileUrl);
  const hasPdf = fileUrl && isPdfFile(fileUrl);
  const hasOtherFile = fileUrl && !hasImage && !hasPdf;

  return (
    <SectionCard title="Financials">
      <GridRow label="Financial Year" value={_val(data?.financial_year)} />
      <GridRow label="Total Assets" value={_money(data?.total_assets)} />
      <GridRow label="Total Revenue" value={_money(data?.total_revenue)} />
      <GridRow label="Net Profit" value={_money(data?.net_profit)} />
      <GridRow label="Net Worth" value={_money(data?.net_worth)} />
      <GridRow label="Asset Ratio" value={_val(data?.asset_ratio)} />
      {hasPdf && (
        <div className="py-3 px-5 bg-blue-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[8.5pt] font-semibold text-[#1E5474] uppercase tracking-wide">
            Financial Statements {showAttachment ? "Shown Below" : "Available"}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className={`print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[8pt] font-bold uppercase tracking-wide border transition-colors cursor-pointer ${
              showAttachment
                ? "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                : "bg-[#1E5474] border-[#1E5474] text-white hover:bg-[#164060]"
            }`}
          >
            {showAttachment ? <><EyeOff size={12} /> Hide</> : <><Paperclip size={12} /> Show Attachment</>}
          </button>
        </div>
      )}
      {hasOtherFile && (
        <div className="py-3 px-5 bg-blue-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[8.5pt] font-semibold text-[#1E5474] uppercase tracking-wide">
            Financial Statements Available
          </span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[8pt] font-bold uppercase tracking-wide border transition-colors cursor-pointer bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Paperclip size={12} /> Open File
          </a>
        </div>
      )}
      {hasImage && (
        <div className="p-4 border-t border-gray-200">
          <img src={fileUrl} alt="Financial Statements" className="max-w-full h-auto mx-auto" />
        </div>
      )}
      {showAttachment && hasPdf && (
        <div className="p-4 border-t border-gray-200">
          <iframe src={fileUrl} title="Financial Statements" className="w-full h-150 border border-gray-200 rounded" />
        </div>
      )}
    </SectionCard>
  );
}

function RegistrationsSection({ data }: { data: RegistrationAccount }) {
  if (!data) return null;
  return (
    <SectionCard title="Registrations">
      <GridRow label="TIN Number" value={_val(data.tin_number)} extra={data.is_tin_verified !== undefined ? _badge(!!data.is_tin_verified) : undefined} />
      <GridRow label="VAT Number" value={_val(data.vat_number)} extra={data.is_vat_verified !== undefined ? _badge(!!data.is_vat_verified) : undefined} />
      <GridRow label="NSSA Number" value={_val(data.nssa_number)} extra={data.is_nssa_verified !== undefined ? _badge(!!data.is_nssa_verified) : undefined} />
      <GridRow label="PRAZ Number" value={_val(data.praz_number)} extra={data.is_praz_verified !== undefined ? _badge(!!data.is_praz_verified) : undefined} />
    </SectionCard>
  );
}

function BankersSection({ accounts }: { accounts: BankerAccount[] }) {
  if (!accounts || accounts.length === 0) return null;
  return (
    <SectionCard title="Bankers">
      <DataTable headers={["Bank", "Branch", "Account Name", "Type", "Currency", "Account No.", "Code", "Date Acquired"]}>
        {accounts.map((b) => (
          <tr key={b.id} className="border-b border-gray-100 even:bg-gray-50">
            <td className="py-2.5 px-4">{_upper(b.bank)}</td>
            <td className="py-2.5 px-4">{_upper(b.branch)}</td>
            <td className="py-2.5 px-4">{_upper(b.account_name)}</td>
            <td className="py-2.5 px-4">{_label(b.account_type)}</td>
            <td className="py-2.5 px-4">{_val(b.account_currency)}</td>
            <td className="py-2.5 px-4">{_val(b.account_number)}</td>
            <td className="py-2.5 px-4 text-center">{_val(b.narration)}</td>
            <td className="py-2.5 px-4 whitespace-nowrap">{_date(b.date_of_acquirement)}</td>
          </tr>
        ))}
      </DataTable>
    </SectionCard>
  );
}

function ProfessionalsSection({ data }: { data: ProfessionalPartner }) {
  if (!data) return null;
  return (
    <SectionCard title="Professional Partners">
      <GridRow label="Auditors" value={_upper(data.auditors)} />
      <GridRow label="Lawyers" value={_upper(data.lawyers)} />
    </SectionCard>
  );
}

function EntityContent({ entity_type, data, showAttachment, onToggleAttachment }: { entity_type: EntityValue; data: Company | Individual; showAttachment: boolean; onToggleAttachment: () => void }) {
  const commonData = data as Company & Individual;

  return (
    <div className="space-y-0 mt-6">
      {/* Entity-specific sections */}
      {entity_type === "company" ? (
        <>
          <CompanyDetailsSection data={data as Company} />
          <CompanyContactSection data={data as Company} />
          {(data as Company).overview && <CompanyOverviewSection data={(data as Company).overview!} />}
          <DirectorsSection directors={(data as Company).directors || []} />
          {(data as Company).shareholdings && <ShareholdingSection data={(data as Company).shareholdings!} />}
          {(data as Company).structure && <StructureSection data={(data as Company).structure!} />}
          {(data as Company).operations && <OperationsSection data={(data as Company).operations!} />}
        </>
      ) : (
        <>
          <IndividualDetailsSection data={data as Individual} />
          <IndividualContactSection data={data as Individual} />
          {(data as Individual).employment_information && <EmploymentSection data={(data as Individual).employment_information!} />}
          {(data as Individual).next_of_kin && <NextOfKinSection data={(data as Individual).next_of_kin!} />}
        </>
      )}

      {/* Common sections */}
      <CreditRecordsSection
        claims={commonData.claims || []}
        absconders={commonData.absconders || []}
        courtJudgements={commonData.court_judgements || []}
        insolvencyRecords={commonData.insolvency_records || []}
        publicInformation={commonData.public_information || []}
      />
      <TradeReferencesSection refs={commonData.trade_references || []} />
      {commonData.financials && <FinancialsSection data={commonData.financials} showAttachment={showAttachment} onToggle={onToggleAttachment} />}
      {commonData.registration_accounts && <RegistrationsSection data={commonData.registration_accounts} />}
      <BankersSection accounts={commonData.banker_accounts || []} />
      {commonData.professional_partners && <ProfessionalsSection data={commonData.professional_partners} />}
    </div>
  );
}

interface props {
  entity_type : EntityValue,
  id: number
}
function ViewEntityDialog({entity_type, id}:props) {
  const {
    data, 
    isLoading,
    error
  } = useGetSingleEntity({
    entity_type,
    id
  })
  const [openControl, setOpenControl] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  return (
    <Dialog
      open = {openControl}
      onOpenChange={setOpenControl}
    >
      <DialogTrigger> 
        <div
          className="rounded-full self-center cursor-pointer flex dark:bg-[#1A2330] bg-gray-100 border p-2"
        >
          <Eye size={15}/>
        </div>
      </DialogTrigger>
      <DialogContent className="md:max-w-250 sm:max-h-[90vh] overflow-y-auto light bg-white text-gray-900">
        <div ref = {printRef}>
          <style type="text/css" media="print">{`
            @page {
              size: A4;
              margin: 14mm 14mm 18mm 14mm;
            }
          `}</style>
          <div className="flex justify-between mb-10">
            <div>
            <img src="/logo/logo.png" className="w-80 h-auto" alt="Fincheck Logo" />
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">FINCHECK (PVT) LTD</h2>
              <p className="text-sm text-gray-500">8th Floor Club Chambers</p>
              <p className="text-sm text-gray-500">Corner Nelson Mandela and Third Street</p>
              <p className="text-sm text-gray-500">Harare, Zimbabwe</p>
              <p className="text-sm text-gray-500">VAT Number: 220191384</p>
              <p className="text-sm text-gray-500">TIN: 2000032265</p>
              <p className="text-sm text-gray-500">accounts@fincheckzim.com</p>
              <p className="text-sm text-gray-500">(242)-704891/4</p>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-gray-400" size={32} />
              <span className="ml-3 text-gray-500 text-sm">Loading entity information...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm font-medium">Failed to load entity information.</p>
              <p className="text-gray-400 text-xs mt-1">{(error as Error)?.message || "An unexpected error occurred."}</p>
            </div>
          )}

          {/* Entity information */}
          {data && !isLoading && !error && (
            <EntityContent
              entity_type={entity_type}
              data={data}
              showAttachment={showAttachment}
              onToggleAttachment={() => setShowAttachment(prev => !prev)}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose>
            <Button variant={"ghost"}>Cancel</Button>
          </DialogClose>
          <Button onClick={handlePrint}>
            <Printer/>
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewEntityDialog