import useProfessionalPartners from "@/hooks/useProfessionalPartners";
import Fieldset from "./FieldSet";
import { Label } from "../ui/label";
import ColumnsContainer from "./ColumnsContainer";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

function ProfessionalPartnersDetails() {
    const {
        handleSubmit,
        onSubmit,
        register,
    } = useProfessionalPartners()
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
                <Button className="self-end">
                    Submit
                </Button>
            </Fieldset>
        </form>
    )
}

export default ProfessionalPartnersDetails