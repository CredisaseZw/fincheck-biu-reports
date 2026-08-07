import { setItem } from '@/lib/storage';
import { useState } from 'react'

function useSectionTouched(key: string) {
    const [touched, setTouched] = useState(false)
    
    const onTouched = () =>{
        setTouched(true)
        setItem(key, "touched", 60 * 60 * 1000 * 24 * 3)
    }

    return {
        touched, 
        onTouched,
  }
}

export default useSectionTouched