import { useQueryClient } from "@tanstack/react-query"
import type { QueryKey } from "@tanstack/react-query"

type Path = (string | number)[]

function useOptimisticCacheUpdate<T extends {id : number}>(key: QueryKey) {
    const queryClient = useQueryClient()
    const updateSection = (
        path: Path,
        value: any
    ) => {
        queryClient.setQueryData(key, (prev: any) => {
            if (!prev) return prev

            const clone = structuredClone(prev)

            let current = clone

            for (let i = 0; i < path.length - 1; i++) {
                const segment = path[i]
                if (current[segment] === undefined) return prev
                current = current[segment]
            }

            const lastKey = path[path.length - 1]
            current[lastKey] = value
            return clone
        })
    }

    const updateRoot = (updater: Partial<T> | ((prev: T) => T)) => {
        queryClient.setQueryData(key, (prev: any) => {
            if (!prev) return prev

            return typeof updater === "function"
                ? updater(prev)
                : { ...prev, ...updater }
        })
    }

    const updateListItem = (
        listKey: string,
        id: string,
        updater: any
    ) => {
        queryClient.setQueryData(key, (prev: any) => {
            if (!prev || !prev[listKey]) return prev

            const clone = structuredClone(prev)

            clone[listKey] = clone[listKey].map((item: any) =>
                item.id === id
                    ? typeof updater === "function"
                        ? updater(item)
                        : updater
                    : item
            )

            return clone
        })
    }

    const removeById = (listKey: string, id: string) => {
        queryClient.setQueryData(key, (prev: any) => {
            if (!prev || !prev[listKey]) return prev

            const clone = structuredClone(prev)

            clone[listKey] = clone[listKey].filter(
                (item: any) => item.id !== id
            )

            return clone
        })
    }   

    const remove = async (id: number, list_key: QueryKey) => { 
        
        await queryClient.cancelQueries({ queryKey: list_key }) 
        queryClient.setQueryData(list_key, (prev: any) => {
            if (!prev) 
                return prev 
            return { 
                ...prev, 
                count: 
                prev.count - 1, results:
                prev.results.filter((item: T) => item.id !== id), 
    } }) }

    return {
        remove,
        updateSection,
        updateRoot,
        updateListItem,
        removeById,
    }
}

export default useOptimisticCacheUpdate