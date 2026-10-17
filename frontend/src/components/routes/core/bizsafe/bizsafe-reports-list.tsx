import BaseTable from "@/components/general/BaseTable";
import BizsafeReportsListFormHeader from "@/components/general/BizsafeReportsListFormHeader";
import SectionHeaderTitle from "@/components/general/SectionHeaderTitle";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { BIZ_SAFE_RESPONSE_TABLE } from "@/constants";
import ViewBizsafeEntityReports from "@/dialogues/ViewBizsafeEntityReports";
import useBizsafeReportsList from "@/hooks/useBizsafeReportsList";
import type { ReportGroup } from "@/types/core";

function BizsafeReportsList() {
  const {
    results,
    setResults
  } = useBizsafeReportsList();

  return (
    <div className="flex flex-col gap-5">
      <SectionHeaderTitle title="Report lIST"/>
      <BizsafeReportsListFormHeader setResults = {setResults}/>
      {
        results &&      
        <div className="card flex flex-col gap-5">
          <div className = "flex flex-row justify-between">
            <h3 className="font-semibold text-sm">Showing results from {results.period.start} to {results.period.end}</h3>
            {
              results.results.length !== 0 &&
              <Button>Download All</Button>
            }
          </div>
          
          <BaseTable
            isEmpty = {results.results.length === 0}
            headers={ BIZ_SAFE_RESPONSE_TABLE } 
          >
            {
              results.results.map((item: ReportGroup, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-center">{item.count}</TableCell>
                  <TableCell className="flex items-center justify-center">
                    <ViewBizsafeEntityReports
                      companyName={item.name}
                      reports={item.reports}
                      groupBy={results.group_by}
                      label={results.period.label}
                    />
                  </TableCell>
                </TableRow>
              ))
            }
          </BaseTable>
        </div>
      }

    </div>
  )
}

export default BizsafeReportsList