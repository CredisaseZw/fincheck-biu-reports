import { ABSCONDER_HEADERS, CLEAR_MESSAGE } from "@/constants";
import Fieldset from "./FieldSet";
import BaseTable from "./BaseTable";
import { TableCell, TableRow } from "../ui/table";
import { StatusPill } from "./StatusPills";
import type { AbsconderProps } from "@/types/core";
import { display, money, statusVariant, date } from "@/lib/utils";

function AbsconderDetails({ absconders_data }: AbsconderProps) {
    return (
        <Fieldset legendTitle="Absconder Records">
            {absconders_data.length === 0 && (
                <div className="text-center text-muted-foreground">{CLEAR_MESSAGE}</div>
            )}
            {absconders_data.length > 0 && (
                <BaseTable isEmpty={false} headers={ABSCONDER_HEADERS}>
                    {absconders_data.map((absconder) => (
                        <TableRow key={absconder.id}>
                            <TableCell>{display(absconder.creditor_name)}</TableCell>
                            <TableCell>{display(absconder.account_number)}</TableCell>
                            <TableCell className="text-center">{display(absconder.currency)}</TableCell>
                            <TableCell className="text-center">{money(absconder.amount)}</TableCell>
                            <TableCell className="text-center">{money(absconder.overdue_balance)}</TableCell>
                            <TableCell className="whitespace-nowrap">{date(absconder.start_date)}</TableCell>
                            <TableCell>
                                <StatusPill variant={statusVariant(absconder.status)}>
                                    {display(absconder.status)}
                                </StatusPill>
                            </TableCell>
                        </TableRow>
                    ))}
                </BaseTable>
            )}
        </Fieldset>
    );
}

export default AbsconderDetails;
