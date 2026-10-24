import { Label } from "../ui/label";
import Fieldset from "./FieldSet";

function DirectorshipsDetails() {
  return (
    <div>
        <Fieldset legendTitle="Directorships">
            <div>
                <Label className="text-xs">Internal Directorships</Label>
                
            </div>
            <div>
                <Label className="text-xs">External Directorships</Label>

            </div>
        </Fieldset>
    </div>
  )
}

export default DirectorshipsDetails