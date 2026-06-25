import { FileText, ImageIcon, FileSpreadsheet, File } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { API_END_POINT } from "@/axios/api";

export default function FileUploadField({
    label,
    error,
    preview,
    inputProps,
    default_file,
}: {
    label: string
    error?: string
    preview?: FileList
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
    default_file?: string
}) {
    const file = preview?.[0]
    
    const getFileDisplayInfo = () => {
        if (file) {
            const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf")
            const isImage = file.type.startsWith("image/")
            const isExcel = file.type.includes("spreadsheet") || file.type.includes("excel") || !!file.name.match(/\.(xls|xlsx|csv)$/i)
            
            return {
                name: file.name,
                isPdf,
                isImage,
                isExcel,
                url: null
            }
        }
        
        if (default_file) {
            const name = default_file.split('/').pop() || "Uploaded File"
            const ext = name.split('.').pop()?.toLowerCase() || ""
            
            const isPdf = ext === "pdf"
            const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
            const isExcel = ["xls", "xlsx", "csv"].includes(ext)
            
            return {
                name,
                isPdf,
                isImage,
                isExcel,
                url: default_file
            }
        }
        return null
    }

    const displayInfo = getFileDisplayInfo()

    const renderIcon = (info: NonNullable<ReturnType<typeof getFileDisplayInfo>>) => {
        if (info.isPdf) return <FileText size={20} className="text-destructive" />
        if (info.isImage) return <ImageIcon size={20} className="text-primary" />
        if (info.isExcel) return <FileSpreadsheet size={20} className="text-green-600" />
        return <File size={20} className="text-muted-foreground" />
    }

    return (
        <div className="form-group">
            <Label>{label}</Label>
            <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors">
                {displayInfo ? (
                    <div className="flex items-center gap-2 text-sm">
                        {renderIcon(displayInfo)}
                        {displayInfo.url ? (
                            <a href={API_END_POINT + displayInfo.url} target="_blank" rel="noopener noreferrer" className="truncate max-w-50 text-primary hover:underline">
                                {displayInfo.name}
                            </a>
                        ) : (
                            <span className="truncate max-w-50">{displayInfo.name}</span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Click to upload document or image</p>
                )}
                <Input type="file" accept=".pdf,image/*,.doc,.docx,.xls,.xlsx" className="cursor-pointer" {...inputProps} />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    )
}
