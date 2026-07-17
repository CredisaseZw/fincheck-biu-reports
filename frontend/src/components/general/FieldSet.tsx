import { cn } from "@/lib/utils"
import type React from "react"

interface props{
    legendTitle : string,
    children : React.ReactNode,
    className? : string
    marginClass? : string
    legendTitleVariant? :"default" | "sm"
}

function Fieldset({legendTitle, children, className, legendTitleVariant = "default", marginClass}: props) {
  const s = legendTitleVariant === "default"
  ? "px-4 font-semibold"
  : "px-2 text-sm"
  return (
    <fieldset className={cn("border flex flex-col gap-3 relative w-full rounded-md  p-5", className, marginClass)} >
        <legend className={cn("text-secondary","text-[1rem]",  s)}> {legendTitle}  </legend>
        {children}
    </fieldset>
  )
}

export default Fieldset