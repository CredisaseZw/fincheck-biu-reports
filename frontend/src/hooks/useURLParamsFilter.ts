import { useSearchParams } from "react-router"

function useURLParamsFilter() {
    const [searchParams, setSearchParams] = useSearchParams();

    function updateFilters(filters: Record<string, string>) {
        const newParams = new URLSearchParams(searchParams)

        Object.entries(filters).forEach(([key, value]) => {
            if (value === "default" || value === "") {
                newParams.delete(key)
            } else {
                newParams.set(key, value)
            }
        })
        newParams.set("page", "1")
        setSearchParams(newParams)
    }

    const setSingleUrlParam = (param:string, value: string) =>{
        const newParams = new URLSearchParams(searchParams)
        if(newParams.get(param)) newParams.delete(param);
        newParams.set(param, value);
        setSearchParams(newParams);
    }
    
    const getUrlParams = () => Object.fromEntries(searchParams.entries());
    
    const removeSingleUrlParam = (param: string) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.delete(param)
        if (param !== "page") {
            newParams.set("page", "1")
        }
        setSearchParams(newParams)
    }

    const resetFilters = () => {
        const params = getUrlParams();
        if (Object.keys(params).length === 0) return false
        setSearchParams({})
        return true
    }

    return {
        resetFilters,
        getUrlParams,
        setSingleUrlParam,
        updateFilters,
        removeSingleUrlParam
    }
}

export default useURLParamsFilter