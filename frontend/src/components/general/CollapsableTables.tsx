import type { MonthlySummary } from "@/types/core";
import EmptyTable from "./EmptyTable";
import CollapsableTable from "./CollapsableTable";

interface props {
    summaries: MonthlySummary[] | undefined
    monthEndDate: string
    year: string
    isEmpty :boolean
}

export default function CollapsableTables({ 
    summaries,
    year,
    isEmpty,
    monthEndDate
}:props ) {
    return (
        isEmpty 
        ? <div className="card">
            <EmptyTable/>
        </div>
        : summaries && <>
            {   
                summaries.map((item, idx) =>(
                    <CollapsableTable
                        label = {item.label}
                        count = {item.count}
                        year= {year}
                        month= {item.month}
                        monthEndDate = {monthEndDate}
                        defaultOpen = {idx === 0}
                    />
                ))
            }
        </>
   
  )
}
