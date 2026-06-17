import type { ListReport } from "@/types/core";
import { useEffect, useState } from "react";
import useGetSingleReport from "./api/useGetSingleReport";
import { handleAxiosError } from "@/lib/utils";
import { useReport } from "@/contexts/ReportMutationContext";

function useAddReportDialogue(report?: ListReport) {
  const { setReport } = useReport();
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useGetSingleReport(
    report?.id,
    Boolean(report && open)
  );

  useEffect(() => {
    if (!open) {
      setReport(null);
    }
  }, [open, setReport]);

  useEffect(() => {
    if (!open) return;

    if (handleAxiosError(error)) {
      setOpen(false);
      return;
    }

    if (data) {
      setReport(data);
    }
  }, [data, error, open, setReport]);

  return { isLoading, open, setOpen };
}

export default useAddReportDialogue;