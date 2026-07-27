import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import LoadingIndicator from "./LoadingIndicator";
import type { Dispatch, SetStateAction } from "react";
import type { EntityValue } from "@/types/core";

interface props {
    searchValue: string,
    isLoading?: boolean
    currentSubject: EntityValue,
    onClear?: ()=>void
    setSearchValue : Dispatch<SetStateAction<string>>,
}

function EnquirySearchBox({
    searchValue,
    isLoading,
    currentSubject,
    setSearchValue,
    onClear
}:props) {
  return (
    <div className="flex flex-row gap-2">
        <div className="relative w-full md:w-md">
            <Input
                className="w-full"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                    currentSubject === "company"
                    ? "e.g Registration Name, registration Number, trading Name"
                    : "e.g Full name, national ID/Passport Number"
                }
            />
            {searchValue && (
                <button
                    type="button"
                    onClick={() => onClear?.()}
                    className="absolute right-5 cursor-pointer top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                > <X size={16} /></button>
            )}
        </div>
        <Button
            className={`w-full md:w-auto ${isLoading ? "cursor-not-allowed" : ""}`}
            disabled={isLoading}
            type="submit"
        >
            {isLoading && <LoadingIndicator variant="button"/>}
            Submit
        </Button>
    </div>
  )
}

export default EnquirySearchBox