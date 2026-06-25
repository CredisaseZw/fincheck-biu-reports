import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DefaultHeaderProps } from "@/types/core";
import LoadingIndicator from "./LoadingIndicator";
import { getCurrentDateFormatted, getFormattedDate } from "@/lib/utils";

interface ReportHeaderCardProps {
    default_header : DefaultHeaderProps | undefined,
    onEdit?: () => void;
}

export default function ReportHeaderCard({
    default_header,
    onEdit,
}: ReportHeaderCardProps) {
    return (
        <div className="relative w-full rounded-xl border border-border bg-primary text-primary-foreground shadow-sm overflow-hidden dark:bg-gray-900 dark:text-gray-200">
            <Button
                className="rounded cursor-pointer z-40 absolute top-4 right-4 gap-2"
                onClick={onEdit}
            >
                <Pencil className="h-4 w-4" />
                Edit
            </Button>
        

            <div className="p-6 md:p-7">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium opacity-80">
                            Client Name
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight uppercase">
                            {
                                default_header?.client_default_search ?? 
                                <LoadingIndicator variant="button"/> 
                            }
                        </h2>
                    </div>

                    <div>
                        <p className="text-sm font-medium opacity-80">
                            Subject Name
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight uppercase">
                            {
                                default_header?.subject_default_search ??
                                <LoadingIndicator variant="button"/> 
                            }
                        </h2>
                    </div>
                </div>

                <div className="my-5 h-px bg-primary-foreground/20 dark:bg-light/20" />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium opacity-80">
                            Enquiry Reference
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {
                                default_header?.enquiry_reference ??
                                <LoadingIndicator variant="button"/> 
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-medium opacity-80">
                            Report Date
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {   default_header?.created_at
                                ? getFormattedDate(default_header.created_at)
                                : getCurrentDateFormatted()
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}