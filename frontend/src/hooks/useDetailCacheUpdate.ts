import { useQueryClient } from "@tanstack/react-query"
import type { QueryKey } from "@tanstack/react-query"


function getAtPath(obj: unknown, path: string[]): unknown {
    return path.reduce((curr: any, key) => curr?.[key], obj)
}

function setAtPath<T>(obj: T, path: string[], value: unknown): T {
    if (path.length === 0) return value as T
    const [first, ...rest] = path
    return {
        ...(obj as Record<string, unknown>),
        [first]: setAtPath((obj as Record<string, unknown>)[first], rest, value),
    } as T
}

function useDetailCacheUpdate<TCache>(queryKey: QueryKey) {
    const queryClient = useQueryClient()

    const patch = (updater: (prev: TCache) => TCache) => {
        queryClient.setQueryData<TCache>(queryKey, (prev) => {
            if (!prev) return prev
            return updater(prev)
        })
    }

    /** Replace value at a nested path
     *  @example cache.set(['subject', 'next_of_kin'], responseData)
     */
    const set = (path: string[], value: unknown) => {
        patch((prev) => setAtPath(prev, path, value))
    }

    /** Merge partial into existing value at a nested path
     *  @example cache.merge(['subject', 'next_of_kin'], { name: 'John' })
     */
    const merge = (path: string[], partial: Record<string, unknown>) => {
        patch((prev) => {
            const current = getAtPath(prev, path) as Record<string, unknown>
            return setAtPath(prev, path, { ...current, ...partial })
        })
    }

    /** Replace one item in a list at path, matched by id
     *  @example cache.updateInList(['claims'], claim.id, updatedClaim)
     */
    const updateInList = (listPath: string[], id: number, item: unknown) => {
        patch((prev) => {
            const list = getAtPath(prev, listPath) as any[]
            if (!list) return prev
            return setAtPath(prev, listPath, list.map((el) => el.id === id ? item : el))
        })
    }

    /** Merge partial into one item in a list, matched by id
     *  @example cache.mergeInList(['claims'], claim.id, { status: 'closed' })
     */
    const mergeInList = (listPath: string[], id: number, partial: Record<string, unknown>) => {
        patch((prev) => {
            const list = getAtPath(prev, listPath) as any[]
            if (!list) return prev
            return setAtPath(prev, listPath, list.map((el) => el.id === id ? { ...el, ...partial } : el))
        })
    }

    /** Remove one item from a list at path, matched by id
     *  @example cache.removeFromList(['claims'], id)
     */
    const removeFromList = (listPath: string[], id: number) => {
        patch((prev) => {
            const list = getAtPath(prev, listPath) as any[]
            if (!list) return prev
            return setAtPath(prev, listPath, list.filter((el) => el.id !== id))
        })
    }

    /** Prepend or append an item to a list at path
     *  @example cache.addToList(['claims'], newClaim)
     */
    const addToList = (listPath: string[], item: unknown, position: "start" | "end" = "start") => {
        patch((prev) => {
            const list = (getAtPath(prev, listPath) as any[]) ?? []
            const updated = position === "start" ? [item, ...list] : [...list, item]
            return setAtPath(prev, listPath, updated)
        })
    }

    return { set, merge, updateInList, mergeInList, removeFromList, addToList }
}

export default useDetailCacheUpdate