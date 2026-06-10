import useCompanyStructure from "@/hooks/useCompanyStructure";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import ColumnsContainer from "./ColumnsContainer";
import Fieldset from "./FieldSet";
import {type CompanyStructureFormData} from "@/hooks/useCompanyStructure"
import { Button } from "../ui/button";

function CompanyStructure() {
    const { 
        handleSubmit,
        register,
    } = useCompanyStructure()

    const onSubmit = (data: CompanyStructureFormData) =>{console.log(data)}

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset legendTitle="Company Structure" className="flex flex-col gap-4">
                <ColumnsContainer numberOfCols={3} gapClass="gap-4">
                    <div className="form-group">
                        <Label>Holding Company</Label>
                        <Textarea
                            {...register("holding_company")}
                            placeholder="Holding company name"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <Label>Subsidiaries</Label>
                        <Textarea
                            {...register("subsidiaries")}
                            placeholder="List of subsidiaries"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <Label>Associated Companies</Label>
                        <Textarea
                            {...register("associated_companies")}
                            placeholder="List of associated companies"
                            rows={3}
                        />
                    </div>
                </ColumnsContainer>
                <ColumnsContainer>
                    <div className="form-group">
                        <Label>Divisions</Label>
                        <Textarea
                            {...register("divisions")}
                            placeholder="List of divisions"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <Label>Branches</Label>
                        <Textarea
                            {...register("branches")}
                            placeholder="List of branches"
                            rows={3}
                        />
                    </div>

                </ColumnsContainer>
                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>
            </Fieldset>
        </form>
    )
}

export default CompanyStructure