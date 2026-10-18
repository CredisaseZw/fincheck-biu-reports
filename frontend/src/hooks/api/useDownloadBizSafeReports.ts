import { api } from "@/axios/api";
import { getCurrentDateFormatted } from "@/lib/utils";
import type { ReportGroupBy, ReportItem } from "@/types/core";
import { useMutation } from "@tanstack/react-query";

export type DownloadPayload = {
  group_by: ReportGroupBy
  label: string 
  groups: { name: string; reports: ReportItem[] }[]
}
function useDownloadBizSafeReports() {
    const {mutate, isPending} = useMutation({
        onMutate: async(payload: DownloadPayload)=>{
            const res = await api.post("/api/bizsafe-reports/download/", payload, { responseType: "blob" })
            const cd = res.headers["content-disposition"] ?? ""
            const name = decodeURIComponent(
            /filename\*=utf-8''([^;]+)/i.exec(cd)?.[1] ?? /filename="?([^";]+)"?/i.exec(cd)?.[1] ?? `report-list ${getCurrentDateFormatted()} ${new Date().toTimeString().slice(0, 8).replace(/:/g, '-')}`
            )
            const url = URL.createObjectURL(res.data)
            const a = Object.assign(document.createElement("a"), { href: url, download: name })
            a.click()
            URL.revokeObjectURL(url)        
    }
    })
    return {
        mutate, 
        isPending
    }
}

export default useDownloadBizSafeReports