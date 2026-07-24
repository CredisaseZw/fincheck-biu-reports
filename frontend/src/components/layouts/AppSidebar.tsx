import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronUp,
  KeyRound,
  LogOut,
} from 'lucide-react'
import { CORE_ROUTES, USERS_LINKS } from "@/constants/routes"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import ChangePasswordDialogue from '@/dialogues/ChangePasswordDialogue';
import CustomSidebarMenuItem from '../general/CustomSidebarMenuItem';

export function AppSidebar() {
    const navigate = useNavigate()
    const {user , signOut} = useAuth()
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)

    return (
    <Sidebar>
        <SidebarHeader className="px-4 pt-5 pb-3">
            <div className="flex flex-col items-center gap-2 rounded-lg bg-light p-4 transition-colors">            
                <div className="flex items-center justify-center w-full max-w-45">
                    <img
                        src="/logo/logo.png"
                        className="h-auto w-full object-contain dark:brightness-110"
                        alt="Fincheck logo"
                    />
                </div>            
                <p className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Credit Reporting
                </p>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>BUSINESS REPORTS</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>

                        {CORE_ROUTES.map((link) => {
                            return <CustomSidebarMenuItem link={link} key={link.link}/>;
                        })}

                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            {
                user?.i_s &&
                <SidebarGroup>
                    <SidebarGroupLabel>INTERNAL USERS</SidebarGroupLabel>
                    <SidebarContent>
                        {
                            USERS_LINKS.map((link) => <CustomSidebarMenuItem link={link} key={link.link}/>)
                        }
                    </SidebarContent>
                </SidebarGroup>
            }
        </SidebarContent>

        <SidebarFooter className="border-t">
            <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-auto py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {   user &&
                            user.full_name.length > 0
                            ? user?.full_name.at(0)?.toLocaleUpperCase()
                            : user?.email.at(0)?.toLocaleUpperCase()
                        }
                    </div>
                    <div className="flex min-w-0 flex-col text-left">
                        <span className="truncate text-sm font-medium">{user && user.full_name ? user.full_name : "-"}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                    <ChevronUp className="ml-auto h-4 w-4 shrink-0" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="top" align="start" className="w-56">
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setChangePasswordOpen(true)}
                    >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Change Password
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => {
                            signOut()
                            navigate("/", {replace:true})
                        }}
                    >
                        { 
                            <LogOut className="mr-2 h-4 w-4" />
                        }
                    
                    Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>

        <ChangePasswordDialogue
            open={changePasswordOpen}
            onOpenChange={setChangePasswordOpen}
        />
    </Sidebar>
  )
}
