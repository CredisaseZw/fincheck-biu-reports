import { CLEAR_MESSAGE, COURT_HEADERS } from "@/constants";
import Fieldset from "./FieldSet";
import BaseTable from "./BaseTable";
import { TableCell, TableRow } from "../ui/table";
import { StatusPill } from "./StatusPills";
import type {  CourtJudgementsProps } from "@/types/core";
import { display, money, statusVariant, date } from "@/lib/utils";

function CourtDetails({ court_judgements_data }: CourtJudgementsProps) {
    return (
        <Fieldset legendTitle="Court Judgements">
            {court_judgements_data.length === 0 && (
                <div className="text-center text-muted-foreground">{CLEAR_MESSAGE}</div>
            )}
            {court_judgements_data.length > 0 && (
                <BaseTable isEmpty={false} headers={COURT_HEADERS}>
                    {court_judgements_data.map((judgement) => (
                        <TableRow key={judgement.id}>
                            <TableCell>{display(judgement.court_name)}</TableCell>
                            <TableCell>{display(judgement.case_number)}</TableCell>
                            <TableCell>{display(judgement.plaintf_name)}</TableCell>
                            <TableCell>{display(judgement.currency)}</TableCell>
                            <TableCell className="text-right">{money(judgement.amount)}</TableCell>
                            <TableCell className="whitespace-nowrap">{date(judgement.judgement_date)}</TableCell>
                            <TableCell>
                                <StatusPill variant={statusVariant(judgement.status)}>
                                    {display(judgement.status)}
                                </StatusPill>
                            </TableCell>
                        </TableRow>
                    ))}
                </BaseTable>
            )}
        </Fieldset>
    );
}

export default CourtDetails;
