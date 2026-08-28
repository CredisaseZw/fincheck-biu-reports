import { CompanyListHeaders, IndividualListHeaders } from "@/constants";
import type { EntityValue, ListCompany, ListIndividual, PaginationData } from "@/types/core";
import BaseTable from "./BaseTable";
import ViewEntityDialog from "@/dialogues/ViewEntityDialog";
import { TableCell, TableRow } from "../ui/table";
import { returnStringedList } from "@/lib/utils";
import OptionsWrapper from "./OptionsWrapper";
import EditEntity from "@/dialogues/EditEntity";

function _render_list_individual_rows(data: ListIndividual[]){
    return (
        data.map((item, idx) => {
            const emails = returnStringedList(item.email ?? "-");
            
            return(
            <TableRow key={idx}>   
                <TableCell>{item.full_name}</TableCell>
                <TableCell>{item.national_id}</TableCell>
                <TableCell className="text-center">{item.gender ?? "-"}</TableCell>
                <TableCell className="text-center">{item.mobile_number ?? "-"}</TableCell>
                <TableCell>
                    <ul>
                        {emails.map((email, index) => (
                        <li key={index}>{email}</li>
                        ))}
                    </ul>
                </TableCell>
                <TableCell className="flex justify-center items-center ">
                  <OptionsWrapper>
                    <ViewEntityDialog
                      entity_type="individual"
                      id={item.id}
                    />
                    <EditEntity
                      entity_type="individual"
                      id={item.id}
                    />
                  </OptionsWrapper>
                </TableCell>
            </TableRow>
        )})
    )    
}

function _render_list_company_rows(data: ListCompany[]) {
  return data.map((item, idx) => {
    const emails = returnStringedList(item.email ?? "-");

    return (
      <TableRow key={item.id ?? idx}>
        <TableCell className="max-w-50 wrap-break-word">{item.registered_name}</TableCell>
        <TableCell className="max-w-50 wrap-break-word">{item.trading_name ?? "-"}</TableCell>
        <TableCell className="text-center whitespace-nowrap">{item.re_registration_number ?? item.registration_number}</TableCell>
        <TableCell className="break-all">
          <ul>
            {emails.map((email, index) => (
              <li key={index}>{email}</li>
            ))}
          </ul>
        </TableCell>
        <TableCell className="whitespace-nowrap">{item.telephone_number}</TableCell>
        <TableCell className="text-center whitespace-nowrap flex items-center justify-center">
          <OptionsWrapper>
            <ViewEntityDialog
              entity_type="company"
              id={item.id}
            />
            <EditEntity
              entity_type="company"
              id={item.id}
            />
          </OptionsWrapper>
          
        </TableCell>
      </TableRow>
    );
  });
}

interface props {
    currentSubject: EntityValue,
    paginationData: PaginationData | undefined,
    listData : Array<ListCompany | ListIndividual>,
    isError : boolean,
    isLoading : boolean,
}

function EnquiryTable({
    currentSubject,
    paginationData,
    listData,
    isError,
    isLoading
}:props) {
  return (
     <div className="flex flex-col gap-3">
        <div className="w-full self-center flex flex-col justify-end">
          <h1 className="text-base  font-bold text-gray-700 dark:text-gray-100">Searched Results</h1>
          <span className="text-sm text-muted-foreground dark:text-gray-200">{listData.length} of {paginationData?.count ?? 0} results</span>
        </div>
        <BaseTable
            headers={
                currentSubject === "company"
                ? CompanyListHeaders
                : IndividualListHeaders
            }
            paginationData={paginationData}
            isEmpty = {listData.length === 0}
            isError = {isError}
            isLoading = {isLoading}
        >
            {
                currentSubject === "company"
                ? _render_list_company_rows(listData as ListCompany[])
                : _render_list_individual_rows(listData as ListIndividual[])   
            }

        </BaseTable>
</div>
  )
}

export default EnquiryTable