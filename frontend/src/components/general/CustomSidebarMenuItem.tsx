import { useEffect, useState } from "react";
import type { RouteItem } from "@/types/core";
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "../ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router";

interface Props {
    link: RouteItem
}

const buttonStyles = cn(
    "py-5 rounded font-normal transition-colors duration-200",
    "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
    "dark:text-zinc-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400",
)
const activeStyles = "bg-blue-50 text-blue-600 font-medium dark:bg-blue-950/30 dark:text-blue-400"

export default function CustomSidebarMenuItem({ link }: Props) {
    const { name, link: navLink, icon: Icon, children } = link
    const { pathname } = useLocation()

    const hasChildren = !!children?.length
    const isMainActive = !!navLink && pathname === navLink
    const isChildActive = hasChildren && children.some((child) => child.link === pathname)

    // Collapsed by default, unless the current page lives inside this group.
    const [open, setOpen] = useState(isChildActive)

    // Navigating into a child from somewhere else expands the group.
    useEffect(() => {
        if (isChildActive) setOpen(true)
    }, [isChildActive])

    // Plain link (no children)
    if (!hasChildren && navLink) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    className={cn(buttonStyles, isMainActive && activeStyles)}
                    asChild
                >
                    <NavLink to={navLink}>
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        <span>{name}</span>
                    </NavLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    // Expandable group
    return (
        <Collapsible
            asChild
            open={open}
            onOpenChange={setOpen}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        type="button"
                        className={cn(buttonStyles, isChildActive && "text-blue-600 dark:text-blue-400")}
                    >
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        <span>{name}</span>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {children?.map(({ name: childName, link: childLink, icon: ChildIcon }) => {
                            if (!childLink) return null
                            const active = pathname === childLink

                            return (
                                <SidebarMenuSubItem key={childLink}>
                                    <SidebarMenuSubButton
                                        className={cn(
                                            "py-4 rounded-md transition-colors duration-200",
                                            "text-gray-600 hover:bg-blue-50/70 hover:text-blue-600",
                                            "dark:text-zinc-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-400",
                                            active && activeStyles
                                        )}
                                        asChild
                                    >
                                        <NavLink to={childLink}>
                                            {ChildIcon && <ChildIcon className="h-3.5 w-3.5 shrink-0" />}
                                            <span>{childName}</span>
                                        </NavLink>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            )
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}