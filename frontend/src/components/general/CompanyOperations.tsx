import useCompanyOperations from "@/hooks/useCompanyOperations"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import { Button } from "../ui/button";
import type { CompanyOperationsProps } from "@/types/core";

function CompanyOperations({
    report_id,
    subject_object_id,
    operations_data,
    subject_type
}:CompanyOperationsProps) {
    const { register, handleSubmit, onSubmit } = useCompanyOperations({
        report_id,
        subject_object_id,
        operations_data,
        subject_type
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Company Operations" className="flex flex-col gap-4">
                <div className="form-group">
                    <Label>Industry</Label>
                    <Input {...register("industry")} placeholder="e.g. Financial Services" />
                </div>

                <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                    <div className="form-group">
                        <Label>Target Markets</Label>
                        <Textarea {...register("target_markets")} rows={3} placeholder="Describe target markets" />
                    </div>

                    <div className="form-group">
                        <Label>Operations Territories</Label>
                        <Textarea {...register("operations_territories")} rows={3} placeholder="List territories" />
                    </div>

                    <div className="form-group">
                        <Label>Property Ownership</Label>
                        <Textarea {...register("property_ownership")} rows={3} placeholder="Describe property ownership" />
                    </div>

                    <div className="form-group">
                        <Label>Operational Areas</Label>
                        <Textarea {...register("operational_areas")} rows={3} placeholder="List operational areas" />
                    </div>
                </ColumnsContainer>

                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>

            </Fieldset>
        </form>
    )
}

export default CompanyOperations