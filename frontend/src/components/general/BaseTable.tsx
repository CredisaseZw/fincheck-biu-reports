import type { Header, PaginationData } from "@/types/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingIndicator from "./LoadingIndicator";
import { Unplug } from "lucide-react";
import EmptyTable from "./EmptyTable";
import { cn } from "@/lib/utils";
import Paginator from "./Paginator";
import React from "react";

export interface BaseTableProps {
  headers?: Header[];
  children?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  paginationName?: string;
  innerTableClassName?: string
  paginationData?: PaginationData;
  tableClass?: string;
}

// Safe layout mapping for alignment to prevent Tailwind compilation omission issues
const alignmentMap: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function BaseTable({
  tableClass,
  headers = [],
  children,
  isLoading = false,
  isError = false,
  isEmpty = true,
  paginationData,
  paginationName = "page",
  errorMessage,
  innerTableClassName
}: BaseTableProps) {
  const colSpan = headers.length || 1;
  const showChildren = !isLoading && !isError && !isEmpty;

  const renderStateMessage = () => {
    if (children && React.Children.count(children) > 0) return null;

    if (isLoading) {
      return (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan}>
            <div className="flex items-center justify-center py-12">
              <LoadingIndicator />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (isError) {
      return (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan}>
            <div className="h-[30vh] w-full flex flex-col justify-center items-center gap-3 text-center px-4">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive dark:bg-destructive/10">
                <Unplug size={28} />
              </div>
              <span className="text-base font-semibold text-foreground">
                An error occurred
              </span>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {errorMessage ?? "Please check your network and try again."}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (isEmpty) {
      return (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan}>
            <div className="py-10">
              <EmptyTable />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return null;
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full rounded-md border border-border bg-card shadow-sm dark:bg-zinc-950/20">
        <Table 
          className={cn("h-fit w-full border-collapse", tableClass)}
          innerTableClassName = {innerTableClassName}
        >
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40 dark:bg-zinc-900/50">
              {headers.map((header, index) => {
                const alignmentClass = header.textAlign 
                  ? alignmentMap[header.textAlign] 
                  : "text-center";

                return (
                  <TableHead
                    key={header.name || index}
                    colSpan={header.colSpan}
                    className={cn(
                      "px-4 py-3.5 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors",
                      alignmentClass,
                      header.className
                    )}
                  >
                    {header.name}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          
          <TableBody className="h-full bg-transparent">
            {renderStateMessage()}
            {showChildren && children}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Module: Fixed hardcoded white box container out */}
      {paginationData && (
        <div className="w-full flex items-center justify-end px-1 py-2">
          <Paginator
            paginationData={paginationData}
            paginationName={paginationName}
          />
        </div>
      )}
    </div>
  );
}

export default BaseTable;