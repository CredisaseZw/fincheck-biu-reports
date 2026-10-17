import BizsafeReportsList from "@/components/routes/core/bizsafe/bizsafe-reports-list";
import BusinessReports from "@/components/routes/core/reports/business-reports";
import Dashboard from "@/components/routes/core/reports/dashboard";
import InternalUsers from "@/components/routes/core/reports/internal-users";
import LiveReports from "@/components/routes/core/reports/live-reports";
import type { RouteItem } from "@/types/core";
import { Archive, FileText, LayersPlus, LayoutDashboardIcon, Users2} from "lucide-react";

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

export const BIZ_SAFE_ROUTES: RouteItem[] = [
  {
    name: 'Bizsafe Reports',
    icon: LayersPlus,
    children: [
      {
        name: 'Reports List',
        link: '/bizsafe-reports-list',
        icon: FileText,
        component: BizsafeReportsList,
      }
    ]
  }
]

export const USERS_LINKS: RouteItem[] = [
  {
    name: 'Internal Users',
    link: '/internal-users',
    icon: Users2,
    component: InternalUsers,

  }
]


export const ROUTES = [...CORE_ROUTES, ...USERS_LINKS, ...BIZ_SAFE_ROUTES]