import type { IndividualDirectorsProps } from "@/types/core";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import Fieldset from "./FieldSet";
import useIndividualDirectorships from "@/hooks/useIndividualDirectorships";
import CustomSubmitButton from "./CustomSubmitButton";

function DirectorshipsDetails({
    subject_object_id,
    subject_type,
    report_id,
    directorships_data
}:IndividualDirectorsProps) {
    const {
        register,
        handleSubmit,
        onSubmit,
        isPending,
        touched
    } = useIndividualDirectorships({
        subject_object_id,
        subject_type,
        report_id,
        directorships_data
    })
    const otherDirectors = directorships_data?.other_directors ?? [];

    return (        
    <div>
        <Fieldset legendTitle="Directorships">
            <div>
                {
                    otherDirectors.length === 0 ? (
                    <span className="block text-center">NO OTHER DIRECTORS FOUND</span>
                    ) : (
                        <div className="card">
                            <ol className="mt-2 space-y-3">
                                {otherDirectors.map((item, index) => {
                                    const creditLines = (item.company_credit_records ?? "")
                                    .split("\n")
                                    .map((line) => line.trim())
                                    .filter(Boolean);

                                    return (
                                    <li key={item.id} className="flex gap-3">
                                        <span className="text-sm font-semibold">{index + 1}.</span>

                                        <div className="flex-1">
                                        <p className="text-sm font-medium uppercase">
                                            {item.position} AT {item.company?.registered_name ?? "N/A"}
                                        </p>

                                        {creditLines.length > 0 ? (
                                            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                            {creditLines.map((line, i) => (
                                                <li key={i}>{line}</li>
                                            ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                            No credit records
                                            </p>
                                        )}
                                        </div>
                                    </li>
                                    );
                                })}
                            </ol>
                        </div>
                    )}
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div className="form-group">
                    <Label className="text-sm">External Directorships</Label>
                    <Textarea
                        {
                            ...register("external_directors")
                        }
                        placeholder="Enter external directorships"
                        className="w-full"
                    />
                </div>
                <CustomSubmitButton
                    state = {touched}
                    isPending = {isPending}
                />
            </form>
        </Fieldset>
    </div>
  )
}

export default DirectorshipsDetails