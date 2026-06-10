import useNextOfKin, { type NextOfKinFormData } from "@/hooks/useNextOfKin"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import ColumnsContainer from "./ColumnsContainer"
import Fieldset from "./FieldSet"

function NextOfKin() {
    const { register, handleSubmit, errors } = useNextOfKin()

    const onSubmit = (data: NextOfKinFormData) => console.log(data)

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

                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>
            </Fieldset>
        </form>
    )
}

export default NextOfKin