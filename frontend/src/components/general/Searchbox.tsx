import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import useURLParamsFilter from "@/hooks/useURLParamsFilter"
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface props {
    className?: string
}

function SearchBox({className}:props) {
    const [value, setValue] = useState("")
    const { setSingleUrlParam, getUrlParams, removeSingleUrlParam } = useURLParamsFilter()

    useEffect(()=>{
        const params = getUrlParams()
        if(params.search) setValue(String(params.search));
    }, [getUrlParams])

    return (
        <form 
            className={
                cn( 
                    "relative w-full max-w-100 flex items-center justify-center",
                    className
                )
            }
            onSubmit={(e)=>{
            e.preventDefault()
            if(value.length <= 0) return removeSingleUrlParam("search")
            setSingleUrlParam("search", value)
        }}>
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 self-center text-muted-foreground pointer-events-none"
            />
            <Input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search something"
                className="w-full px-9"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => {
                        removeSingleUrlParam("search")
                        setValue("")
                    }}

                    className="absolute right-13 cursor-pointer top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={16} />
                </button>
            )}
            <button 
                type={"submit"}
                className="absolute right-3 top-1/2 -translate-y-1/2 outline-0 bg-primary p-2 rounded hover:bg-primary/80 cursor-pointer"
                >
                <Search size={15} color="white"/>
            </button>
        </form>
    )
}

export default SearchBox