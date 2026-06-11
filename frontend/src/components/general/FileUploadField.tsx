import { FileText, ImageIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function FileUploadField({
    label,
    error,
    preview,
    inputProps,
}: {
    label: string
    error?: string
    preview?: FileList
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
}) {
    const file = preview?.[0]
    const isPdf = file?.type === "application/pdf"

    return (
        <div className="form-group">
            <Label>{label}</Label>
            <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors">
                {file ? (
                    <div className="flex items-center gap-2 text-sm">
                        {isPdf
                            ? <FileText size={20} className="text-destructive" />
                            : <ImageIcon size={20} className="text-primary" />
                        }
                        <span className="truncate max-w-50">{file.name}</span>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Click to upload PDF or image</p>
                )}
                <Input type="file" accept=".pdf,image/*,.doc,.docx,.xls,.xlsx" className="cursor-pointer" {...inputProps} />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    )
}
