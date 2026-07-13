import useProfessionalPartners from "@/hooks/useProfessionalPartners";
import Fieldset from "./FieldSet";
import { Label } from "../ui/label";
import ColumnsContainer from "./ColumnsContainer";
import { Textarea } from "../ui/textarea";
import type { ProfessionalsProps } from "@/types/core";
import CustomSubmitButton from "./CustomSubmitButton";

function ProfessionalPartnersDetails({
    report_id,
    subject_object_id,
    subject_type,
    professionals_data
}:ProfessionalsProps) {
    const {
        touched,
        handleSubmit,
        onSubmit,
        register,
        isPending
    } = useProfessionalPartners({
        report_id,
        subject_object_id,
        subject_type,
        professionals_data
    })
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Professional Partners">
                <ColumnsContainer>
                    <div className="form-group">
                        <Label>Auditors</Label>
                        <Textarea
                            {...register("auditors")}
                        />
                    </div>
                    <div className="form-group">
                        <Label>Lawyers</Label>
                        <Textarea
                            {...register("lawyers")}
                        />
                    </div>
                </ColumnsContainer>
                <CustomSubmitButton
                        state={touched}
                        isPending={isPending}
                    />
            </Fieldset>
        </form>
    )
}

export default ProfessionalPartnersDetails