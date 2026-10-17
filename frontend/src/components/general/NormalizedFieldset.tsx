import { cn } from "@/lib/utils"
import type React from "react"

interface props{
    legendTitle : string,
    children : React.ReactNode,
    className? : string
    marginClass? : string
    legendTitleVariant? :"default" | "sm"
}

function NormalizedFieldset({legendTitle, children, className, legendTitleVariant = "default", marginClass = "mb-5"}: props) {
  const s = legendTitleVariant === "default"
  ? "px-4 font-semibold"
  : "px-2 text-sm"
  return (
    <fieldset className={cn("border-color relative w-full rounded-xl border bg-white/50 p-5 dark:bg-transparent", className, marginClass)} >
        <legend className={cn("text-zinc-800 dark:text-gray-200", s)}> {legendTitle}  </legend>
        {children}
    </fieldset>
  )
}

export default NormalizedFieldset