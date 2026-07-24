import type { RouteItem } from "@/types/core";
import { useMemo } from "react";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "../ui/sidebar";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router";
import { useLocation } from "react-router-dom";

interface props{
    link : RouteItem
}
export default function CustomSidebarMenuItem({
    link,
}: props) {
    const {
    name, 
    link: navLink, 
    icon: Icon,
    children
    }= useMemo(()=> link, [link])
    const location = useLocation();
    const isMainActive = location.pathname === navLink;

    return (
        <SidebarMenuItem className="flex gap-5">
            <SidebarMenuButton
                className={cn(
                    "py-5 rounded font-normal transition-colors duration-200",
                    "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
                    "dark:text-zinc-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400",
                    isMainActive && "bg-blue-50 text-blue-600 font-medium dark:bg-blue-950/30 dark:text-blue-400"
                )}
                asChild
            >
                <NavLink to={navLink}>
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span>{name}</span>
                </NavLink>
            </SidebarMenuButton>

            {children && (
                <SidebarMenuSub>
                    {children.map(({ name: childName, link: childLink, icon: ChildIcon }) => {
                        const isChildActive = location.pathname === childLink;

                        return (
                            <SidebarMenuSubItem key={childLink}>
                                <SidebarMenuSubButton 
                                    className={cn(
                                        "py-4 rounded-md transition-colors duration-200",
                                        "text-gray-600 hover:bg-blue-50/70 hover:text-blue-600",
                                        "dark:text-zinc-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-400",
                                        isChildActive && "bg-blue-50 text-blue-600 font-medium dark:bg-blue-950/30 dark:text-blue-400"
                                    )}
                                    asChild
                                >
                                    <NavLink to={childLink}>
                                        {ChildIcon && <ChildIcon className="h-3.5 w-3.5 shrink-0" />}
                                        <span>{childName}</span>
                                    </NavLink>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        );
                    })}
                </SidebarMenuSub>
                )}
        </SidebarMenuItem>
  )
}
