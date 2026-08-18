import { CompanyListHeaders, IndividualListHeaders } from "@/constants";
import type { EntityValue, ListCompany, ListIndividual, PaginationData } from "@/types/core";
import BaseTable from "./BaseTable";
import ViewEntityDialog from "@/dialogues/ViewEntityDialog";
import { TableCell, TableRow } from "../ui/table";

function _render_list_individual_rows(data: ListIndividual[]){
    return (
        data.map((item, idx) => (
            <TableRow key={idx}>   
                <TableCell>{item.full_name}</TableCell>
                <TableCell>{item.national_id}</TableCell>
                <TableCell className="text-center">{item.gender ?? "-"}</TableCell>
                <TableCell className="text-center">{item.mobile_number ?? "-"}</TableCell>
                <TableCell>{item.email ?? "-"}</TableCell>
                <TableCell className="flex justify-center">
                    <ViewEntityDialog
                        entity_type={"individual"}
                        id={item.id}
                    />
                </TableCell>
            </TableRow>
        ))
    )    
}

function _render_list_company_rows(data: ListCompany[]){
    return (
        data.map((item, idx)=> (
            <TableRow key={idx}>
                <TableCell>{item.registered_name}</TableCell>
                <TableCell>{item.trading_name ?? "-"}</TableCell>
                <TableCell className="text-center">{item.re_registration_number ?? item.registration_number}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.telephone_number}</TableCell>
                <TableCell className="flex justify-center">
                   <ViewEntityDialog
                        entity_type={"company"}
                        id = {item.id}
                   />
                </TableCell>
            </TableRow>
        ))
    )
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
     <div>
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