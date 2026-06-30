import { EllipsisVerticalIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type React from "react";

interface props{
    children : React.ReactNode
}

function OptionsWrapper({children}:props) {
  return (
    <Popover>
        <PopoverTrigger className="rounded-full self-center cursor-pointer flex dark:bg-[#1A2330] bg-gray-100 border p-2">
            <EllipsisVerticalIcon
                size={15}
            />
        </PopoverTrigger>
        <PopoverContent className="rounded-md p-2.5 flex flex-col gap-1.5 w-fit">
            {children}
        </PopoverContent>
    </Popover>
  )
}

export default OptionsWrapper