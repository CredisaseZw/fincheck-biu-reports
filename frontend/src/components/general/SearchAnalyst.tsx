import { useState, useRef, useEffect, useCallback, useId } from "react"
import type { KeyboardEvent, FormEvent, MouseEvent } from "react"
import { cn, handleAxiosError } from "@/lib/utils"
import { X } from "lucide-react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverAnchor } from "../ui/popover";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import useGetAnalystApi from "@/hooks/api/useGetAnalystApi";
import type { User } from "@/types/core";

interface Props {
    onSelectAnalyst: (analyst_id: number | null) => void
}

const SearchAnalyst = ({
    onSelectAnalyst,
}: Props) => {
    const [ query, setQuery ] = useState("")
    const [ searchTerm, setSearchTerm ] = useState<string | null>(null)
    const [ isOpen, setIsOpen ] = useState(false)
    const [ activeIndex, setActiveIndex ] = useState(-1)
    const [ selected, setSelected ] = useState<User | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const scrollOnChange = useRef(false)
    const listId = useId()

    const { data, error, isLoading } = useGetAnalystApi({
        params: {
            search: searchTerm,
            user_type: "internal"
        },
        enabled: !!searchTerm
    })

    const results = data?.results ?? []

    useEffect(() => {
        if (!error) return
        handleAxiosError(error)
    }, [error])

    const close = useCallback(() => {
        setIsOpen(false)
        setActiveIndex(-1)
    }, [])

    const open = useCallback(() => {
        setIsOpen(true)
        setActiveIndex(-1)
    }, [])

    const handleOpenChange = (next: boolean) => {
        if (next) setIsOpen(true)
        else close()
    }

    useEffect(() => {
        if (activeIndex < 0 || !scrollOnChange.current) return
        scrollOnChange.current = false
        document.getElementById(`${listId}-opt-${activeIndex}`)?.scrollIntoView({ block: "nearest" })
    }, [activeIndex, listId])

    const select = useCallback((item: User) => {
        setSelected(item)
        setQuery(item.full_name)
        setSearchTerm(null)
        setIsOpen(false)
        setActiveIndex(-1)
        onSelectAnalyst(item.id)
    }, [onSelectAnalyst])

    const clear = useCallback((e?: MouseEvent) => {
        e?.stopPropagation()
        setSelected(null)
        setQuery("")
        setSearchTerm(null)
        setActiveIndex(-1)
        inputRef.current?.focus()
        onSelectAnalyst(null)
    }, [onSelectAnalyst])

    const handleSubmit = useCallback((e?: FormEvent) => {
        e?.preventDefault()
        const trimmed = query.trim()
        if (!trimmed) return
        setIsOpen(true)
        setActiveIndex(-1)
        setSearchTerm(trimmed)
    }, [query])

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                if (!isOpen) { open(); break }
                if (results.length === 0) break
                scrollOnChange.current = true
                setActiveIndex((i) => Math.min(i + 1, results.length - 1))
                break
            case "ArrowUp":
                if (!isOpen || results.length === 0) break
                e.preventDefault()
                scrollOnChange.current = true
                setActiveIndex((i) => Math.max(i - 1, 0))
                break
            case "Enter":
                e.preventDefault()
                if (isOpen && activeIndex >= 0 && results[activeIndex]) {
                    select(results[activeIndex])
                } else {
                    handleSubmit()
                }
                break
            case "Escape":
                close()
                inputRef.current?.blur()
                break
        }
    }

    const renderBody = () => {
        if (!searchTerm) {
            return (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                    Press enter or tap search to look up analyst
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
                    No results found for "{searchTerm}"
                </div>
            )
        }
        return results.map((result, i) => {
            const isActive = activeIndex === i
            const isSelected = selected?.id === result.id
            return (
                <button
                    key={result.id}
                    id={`${listId}-opt-${i}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => { e.preventDefault(); select(result) }}
                    className={cn(
                        "text-gray-700 dark:text-white",
                        "w-full text-left flex items-center justify-between px-3 py-2.5 text-sm transition-colors duration-75 cursor-pointer",
                        isActive ? "bg-accent" : "bg-popover",
                    )}
                >
                    <div className="flex flex-col gap-1">
                        <span className="truncate font-semibold">{result.full_name}</span>
                        <span>{result.email ?? "-"}</span>
                    </div>

                    {isSelected && (
                        <svg className="w-4 h-4 shrink-0 text-ring" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
            )
        })
    }

    const showSpinner = isLoading && isOpen

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange} modal={false}>
            <div ref={containerRef} className="form-group w-full relative">
                <PopoverAnchor asChild>
                    <form onSubmit={handleSubmit} className="relative flex items-center mt-1">

                        {showSpinner ? (
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
                                setQuery(e.target.value)
                                // Typing after a selection invalidates it.
                                if (selected) {
                                    setSelected(null)
                                    onSelectAnalyst(null)
                                }
                            }}
                            onFocus={open}
                            onKeyDown={handleKeyDown}
                            placeholder="Full name, email"
                            className="pl-9 pr-14"
                            role="combobox"
                            aria-haspopup="listbox"
                            aria-expanded={isOpen}
                            aria-controls={listId}
                            aria-autocomplete="list"
                            aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
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
                            <Button size="icon-sm" type="submit" aria-label="Search analysts">
                                <Search />
                            </Button>
                        </div>
                    </form>
                </PopoverAnchor>

                <PopoverContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    // Clicks on the input/search button are "outside" the popover content;
                    // don't let Radix close it for those.
                    onInteractOutside={(e) => {
                        if (containerRef.current?.contains(e.target as Node)) e.preventDefault()
                    }}
                    align="start"
                    sideOffset={4}
                    className="w-(--radix-popover-trigger-width) p-1 max-h-60 overflow-y-auto rounded"
                >
                    <div id={listId} role="listbox" className="flex flex-col">
                        {renderBody()}
                    </div>
                </PopoverContent>
            </div>
        </Popover>
    )
}

export default SearchAnalyst