import BusinessReports from "@/components/routes/core/reports/business-reports";
import Dashboard from "@/components/routes/core/reports/dashboard";
import LiveReports from "@/components/routes/core/reports/live-reports";
import type { RouteItem } from "@/types/core";
import { Archive, FileText, LayoutDashboardIcon} from "lucide-react";

export const CORE_ROUTES: RouteItem[] = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    icon: LayoutDashboardIcon,
    component: Dashboard,
  },
  {
    name: 'Active Reports',
    link: '/active-reports',
    icon: FileText,
    component: LiveReports,
  },
  {
    name: 'Archived Reports',
    link: '/archived-reports',
    icon: Archive,
    component: BusinessReports,
  }
]