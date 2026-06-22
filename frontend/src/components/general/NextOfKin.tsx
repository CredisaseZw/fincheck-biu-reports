import useNextOfKin, { type NextOfKinFormData } from "@/hooks/useNextOfKin"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"
import CustomSubmitButton from "./CustomSubmitButton";

interface props {
    next_of_kin : NextOfKinFormData | undefined
}

function NextOfKin({next_of_kin}: props) {
    const { 
        onSubmit,
        register,
        handleSubmit, 
        errors
     } = useNextOfKin(next_of_kin)

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Next of Kin / Reference" className="flex flex-col gap-4">
                <ColumnsContainer numberOfCols={3} gapClass="gap-4">

                    <div className="form-group">
                        <Label className="required">Name</Label>
                        <Input {...register("name")} />
                        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                    </div>

                    <div className="form-group">
                        <Label className="required">Relationship</Label>
                        <Input {...register("relationship")} />
                        {errors.relationship && <p className="text-destructive text-sm">{errors.relationship.message}</p>}
                    </div>

                    <div className="form-group">
                        <Label className="required">Contact Number</Label>
                        <Input {...register("contact_number")} />
                        {errors.contact_number && <p className="text-destructive text-sm">{errors.contact_number.message}</p>}
                    </div>

                </ColumnsContainer>

                <CustomSubmitButton/>
            </Fieldset>
        </form>
    )
}

export default NextOfKin