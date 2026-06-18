import { useState, useRef, useEffect, useCallback,forwardRef, useImperativeHandle } from "react"
import type { KeyboardEvent } from "react"
import { cn, handleAxiosError } from "@/lib/utils"
import { useDebounce } from "use-debounce"
import { X } from "lucide-react";
import { Input } from "../ui/input";
import type { EntityMode, EntityValue, MiniCompany, MiniIndividual } from "@/types/core";
import useGetEntityObject from "@/hooks/api/useGetEntityObject";
import { Button } from "../ui/button";

interface props {
    entityType: EntityValue,
    entityMode?: EntityMode,
    defaultSearch?: string,
    onSetEntityId:(entity : EntityMode, value: number | null)=> void
    onEnterClientCreationMode?: ()=> void
    onSelectItem?: (id: number)=>void
}
export interface SearchEntityRef {
  clear: () => void
}


const SearchEntity = forwardRef<SearchEntityRef, props>(({ 
    defaultSearch,
    entityMode,
    entityType,
    onSelectItem,
    onSetEntityId,
    onEnterClientCreationMode
    }, ref) => {
    
    const [query, setQuery] = useState(defaultSearch ?? "")
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [selected, setSelected] = useState<MiniCompany | MiniIndividual | null>(null);
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const [debouncedQuery] = useDebounce(query, 400)
    const { data, error, isLoading } = useGetEntityObject(
        entityType,
        { search: debouncedQuery },
        !!debouncedQuery && hasInteracted
    )

    const results = data?.results ?? []

    useEffect(() => {
        if (handleAxiosError(error)) return;
    }, [error])

    const _get_display_value = (item: MiniCompany | MiniIndividual | null) => {
        return item
            ? "national_id" in item
                ? (item as MiniIndividual).full_name
                : (item as MiniCompany).trading_name
            : ""
    }

    const close = useCallback(() => {
        setIsOpen(false)
        setQuery(_get_display_value(selected) || defaultSearch || "")
        setActiveIndex(-1)
    }, [selected, defaultSearch])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                close()
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [close])

    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement
            item?.scrollIntoView({ block: "nearest" })
        }
    }, [activeIndex])

    const open = useCallback(() => { setIsOpen(true); setActiveIndex(-1) }, [])

    const select = useCallback((entity: MiniCompany | MiniIndividual) => {
        setSelected(entity)
        setQuery(_get_display_value(entity) ?? "-")
        setIsOpen(false)
        setActiveIndex(-1)
        inputRef.current?.blur()
        if(entityMode){
            onSetEntityId(entityMode, entity.id)
        } else{
            onSelectItem?.(entity.id)
        }

    }, [onSetEntityId, onSelectItem, entityMode])

    const clear = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelected(null)
        setQuery("")
        setHasInteracted(false)
        inputRef.current?.focus()

        if (entityMode) onSetEntityId(entityMode, null)
    }, [onSetEntityId, entityMode])

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) { open(); return }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setActiveIndex((i) => Math.min(i + 1, results.length - 1))
                break
            case "ArrowUp":
                e.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
                break
            case "Enter":
                e.preventDefault()
                if (activeIndex >= 0 && results[activeIndex]) select(results[activeIndex])
                break
            case "Escape":
                close()
                inputRef.current?.blur()
                break
        }
    }

    const renderBody = () => {
        if (!debouncedQuery) {
            return (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                    Start typing to search
                </div>
            )
        }
        if (isLoading) {
            return (
                <div className="px-3 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 border-2 border-border border-t-ring rounded-full animate-spin" />
                    Searching...
                </div>
            )
        }
        if (error) {
            return (
                <div className="px-3 py-3 text-sm text-destructive text-center">
                    Failed to load results
                </div>
            )
        }
        if (results.length === 0) {
            return (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center space-y-2">
                    No results found for "{debouncedQuery}"
                    <div className="w-full flex justify-center pt-1">
                        <Button
                            onClick={onEnterClientCreationMode}
                            size="sm"
                            variant="outline"
                        >
                            Create Company
                        </Button>
                    </div>
                </div>
            )
        }
        return results.map((result, i) => {
            const isActive = activeIndex === i
            const isSelected = selected?.id === result.id
            return (
                <button
                    key={result.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => { e.preventDefault(); select(result) }}
                    className={cn(
                        "text-gray-700 dark:text-white",
                        "w-full text-left flex items-center justify-between px-3 py-2.5 text-sm transition-colors duration-75 cursor-pointer",
                        isActive ? "bg-accent" : "bg-popover",
                    )}
                >
                    <span className="truncate">{_get_display_value(result)}</span>
                    {isSelected && (
                        <svg className="w-4 h-4 shrink-0 text-ring" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
            )
        })
    }

    useImperativeHandle(ref, () => ({
      clear: () =>  clear()
    }))

    return (
        <div ref={containerRef} className="form-group w-full relative">
            <div className="relative flex items-center mt-1">

                {isLoading && isOpen ? (
                    <span className="absolute left-3 w-4 h-4 border-2 border-border border-t-ring rounded-full animate-spin pointer-events-none" />
                ) : (
                    <svg
                        className={cn(
                            "absolute left-3 w-4 h-4 pointer-events-none transition-colors duration-150",
                            isOpen ? "text-ring" : "text-muted-foreground"
                        )}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                )}

                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setHasInteracted(true)
                        setQuery(e.target.value)
                        open()
                    }}
                    onFocus={open}
                    onKeyDown={handleKeyDown}
                    placeholder={entityType === "company" ? "ABC Inc" : "John Doe"}
                    className="pl-9 pr-14"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    autoComplete="off"
                />

                <div className="absolute right-3 flex items-center gap-1">
                    {selected && !isOpen && (
                        <button
                            type="button"
                            onClick={clear}
                            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            aria-label="Clear selection"
                        >
                            <X size={15} />
                        </button>
                    )}
                    <svg
                        className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform duration-200",
                            isOpen && "rotate-180 text-ring"
                        )}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-0 w-full top-15 rounded-md">
                    <div
                        ref={listRef}
                        role="listbox"
                        className="bg-popover border shadow-lg max-h-60 overflow-y-auto py-1 rounded-md"
                    >
                        {renderBody()}
                    </div>
                </div>
            )}
        </div>
    )
})

export default SearchEntity