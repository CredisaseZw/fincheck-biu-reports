import { CLAIM_HEADERS, CLEAR_MESSAGE } from "@/constants";
import Fieldset from "./FieldSet";
import BaseTable from "./BaseTable";
import { TableCell, TableRow } from "../ui/table";
import { StatusPill } from "./StatusPills";
import type { ClaimsProps } from "@/types/core";
import { display, money, statusVariant, date } from "@/lib/utils";

function ClaimsDetails({ claims_data }: ClaimsProps) {
    return (
        <Fieldset legendTitle="Claim Records">
            {claims_data.length === 0 && (
                <div className="text-center text-muted-foreground">{CLEAR_MESSAGE}</div>
            )}
            {claims_data.length > 0 && (
                <BaseTable isEmpty={false} headers={CLAIM_HEADERS}>
                    {claims_data.map((claim) => (
                        <TableRow key={claim.id}>
                            <TableCell>{display(claim.creditor_name)}</TableCell>
                            <TableCell>{display(claim.account_number)}</TableCell>
                            <TableCell className="text-center">{display(claim.currency)}</TableCell>
                            <TableCell className="text-center">{money(claim.amount)}</TableCell>
                            <TableCell className="text-center">{money(claim.overdue_balance)}</TableCell>
                            <TableCell className="whitespace-nowrap">{date(claim.claim_date)}</TableCell>
                            <TableCell className="flex items-center justify-center">
                                <StatusPill variant={statusVariant(claim.status)}>
                                    {display(claim.status)}
                                </StatusPill>
                            </TableCell>
                        </TableRow>
                    ))}
                </BaseTable>
            )}
        </Fieldset>
    );
}

export default ClaimsDetails;
