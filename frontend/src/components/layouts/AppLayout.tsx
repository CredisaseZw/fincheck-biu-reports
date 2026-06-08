import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '../general/ThemeToggle';

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col min-h-svh">
        <header className="flex bg-light dark:bg-dark justify-between py-3 items-center border-b px-4">
          <SidebarTrigger />
          <ThemeToggle/>
        </header>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}