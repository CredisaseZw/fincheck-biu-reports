import { useState, useRef, useEffect, useCallback } from "react"
import type { KeyboardEvent } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useDebounce } from "use-debounce"
import { X } from "lucide-react";
import { Input } from "../ui/input";

interface props {
    defaultSearch?: string 
}
function SearchEntity({ defaultSearch }:props) {
    const [query, setQuery] = useState(defaultSearch ?? "")
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [hasInteracted, setHasInteracted] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const [debouncedQuery] = useDebounce(query, 400)
    
    return (
        <div>

        </div>
    )
}

export default SearchEntity