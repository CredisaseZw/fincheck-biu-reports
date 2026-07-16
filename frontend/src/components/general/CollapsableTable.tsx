import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { cn, handleAxiosError } from "@/lib/utils";
import { api } from "@/axios/api";
import { ReportHeaders } from "@/constants";
import ArchivedReportsTable from "./ArchivedReportsTable";
import type { ListReport } from "@/types/core";

interface CollapsableTableProps {
  label: string;
  count: number;
  year: string;
  month: number;
  monthEndDate?: string;
  defaultOpen?: boolean;
}


export default function CollapsableTable({
  label,
  count,
  year,
  month,
  monthEndDate = "25",
  defaultOpen = false,
}: CollapsableTableProps) {
    const [open, setOpen] = useState(defaultOpen);

    const { data, isLoading, isFetching, error, isError } = useQuery({
        queryKey: ["reports", "by-month", { year, month, monthEndDate }],
        queryFn:async () =>{
            const response = await api.get<ListReport[]>(`/api/archived-reports/by_month/`, {
                params : {
                    year,
                    month,
                    month_end_date :  monthEndDate
                }
            })
            return response.data
        },
        enabled: open, 
        staleTime: 1000 * 60 * 5,
    });

    if(error)handleAxiosError(error);
    const reports = data ?? [];
    const loading = open && (isLoading || isFetching) && reports.length === 0;

    return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ChevronDown
              className={cn(
                "h-4 w-4 text-teal-600 transition-transform duration-150",
                !open && "-rotate-90"
              )}
            />
            <span className="text-sm font-bold text-[#0A2E44]">{label}</span>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {count} {count === 1 ? "Report" : "Reports"}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-5">
        <ArchivedReportsTable
            isEmpty = {reports.length === 0}
            isError = {isError}
            headers={ReportHeaders}
            isLoading = {loading}
            results={reports}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
