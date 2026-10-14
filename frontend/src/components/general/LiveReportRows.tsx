import { cn, getEntityName, getFormattedDate, toCap } from "@/lib/utils";
import type { ListReport } from "@/types/core";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import SuspendReportDialog from "@/dialogues/SuspendReportDialog";
import { REPORT_STATUS_PILL_VARIANTS } from "@/constants";
import { Fragment, useState } from "react";
import { OptionButton } from "@/components/general/OptionButton";
import OptionsWrapper from "@/components/general/OptionsWrapper";
import { StatusPill } from "@/components/general/StatusPills";
import { TableCell, TableRow } from "@/components/ui/table";
import DeleteReportAlert from "@/dialogues/DeleteReportDialogue";
import AddReportDialogue from "@/dialogues/AddReportDialogue";

const NARRATION_COLLAPSE_AT = 160

export default function LiveReportRows({ item, isStaff }: { item: ListReport, isStaff: boolean }) {
    const [expanded, setExpanded] = useState(false)
    const colSpan = isStaff ? 7 : 6

    const client_bottom_level = "national_id" in item.client
        ? item.client.national_id ?? "-"
        : item.client.re_registration_number ?? item.client.registration_number ?? item.client.trading_name ?? "-"

    const subject_bottom_level = "national_id" in item.subject
        ? item.subject.national_id ?? "-"
        : item.subject.re_registration_number ?? item.subject.registration_number ?? item.subject.trading_name ?? "-"

    const pillVariant = (item.is_stale && item.status === "in_progress")
        ? "danger"
        : REPORT_STATUS_PILL_VARIANTS[item.status]

    const narration = item.report_narration?.trim()
    const isLong = (narration?.length ?? 0) > NARRATION_COLLAPSE_AT

    return (
        <Fragment>
            <TableRow className="border-b-0">
                <TableCell className="text-center">
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">{item.enquiry_reference}</span>
                        <span className="text-xs">
                            {getFormattedDate(item.report_date ?? item.created_at)}
                        </span>
                    </div>
                </TableCell>
                {
                    isStaff &&
                    <TableCell>
                        <div className="flex flex-col gap-1 text-center">
                            <span className="font-bold text-gray-700 dark:text-gray-200">{getEntityName(item.client)}</span>
                            <span>{client_bottom_level}</span>
                        </div>
                    </TableCell>
                }
                <TableCell>
                    <div className="flex flex-col gap-1 text-center">
                        <span className="font-bold text-gray-700 dark:text-gray-200">{getEntityName(item.subject)}</span>
                        <span>{subject_bottom_level}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col gap-1">
                        <span>{item.username?.trim() || "-"}</span>
                        {
                            isStaff &&                       
                            <span className="text-xs text-muted-foreground">
                                Analyst: {item.analyst_name?.trim() || "-"}
                            </span>
                        }
                    </div>
                </TableCell>
                <TableCell className="max-w-50 wrap-break-word">
                    <span className="line-clamp-3">{item.contact_person?.trim() || "-"}</span>
                </TableCell>
                <TableCell className="text-center">
                    <StatusPill variant={pillVariant as any}>
                        {toCap(item.status)}
                    </StatusPill>
                </TableCell>
                <TableCell>
                    <div className="flex items-center justify-center">
                        <OptionsWrapper>
                            {
                                isStaff &&
                                <>
                                    {
                                        (item.status === "finalized")
                                        ? <OptionButton
                                            onClick={() =>
                                                item.report_pdf
                                                    ? window.open(item.report_pdf, "_blank", "noopener,noreferrer")
                                                    : toast.error("Report PDF not available")
                                            }
                                            Icon={ExternalLink}
                                            label="View Report"
                                        />
                                        : <>
                                            {
                                                item.status === "suspended"
                                                ? <SuspendReportDialog
                                                    mode={"unsuspend"}
                                                    reason={item.suspension_reason}
                                                    id={item.id}
                                                />
                                                : <AddReportDialogue report_item={item} />
                                            }
                                        </>
                                    }
                                </>
                            }
                            <DeleteReportAlert
                                id={item.id}
                                disabled={!isStaff && ["in_progress", "suspended", "finalized"].includes(item.status)}
                            />
                        </OptionsWrapper>
                    </div>
                </TableCell>
            </TableRow>
            {
                isStaff &&
                <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colSpan} className="pt-0 pb-3">
                        <div className="rounded-md bg-muted/40 px-3 py-2">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Narration
                            </div>
                            {narration ? (
                                <p className={cn(
                                    "text-sm whitespace-pre-wrap wrap-break-word text-primary",
                                    !expanded && "line-clamp-2"
                                )}>
                                    {narration}
                                </p>
                            ) : (
                                <p className="text-sm italic text-muted-foreground">No narration</p>
                            )}
                            {isLong && (
                                <button
                                    type="button"
                                    onClick={() => setExpanded((v) => !v)}
                                    className="mt-1 text-xs text-primary hover:underline cursor-pointer"
                                >
                                    {expanded ? "Show less" : "Show more"}
                                </button>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            }
        </Fragment>
    )
}
