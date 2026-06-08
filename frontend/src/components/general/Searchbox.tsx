/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import useURLParamsFilter from "@/hooks/useURLParamsFilter"
import { Input } from "../ui/input";

function SearchBox() {
    const [value, setValue] = useState("")
    const { setSingleUrlParam, getUrlParams, removeSingleUrlParam } = useURLParamsFilter()

    useEffect(()=>{
        const params = getUrlParams()
        if(params.search) setValue(String(params.search));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <form className="relative w-full max-w-75 flex items-center justify-center" onSubmit={(e)=>{
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

                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </form>
    )
}

export default SearchBox