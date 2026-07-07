import BusinessReports from "@/components/routes/core/reports/business-reports";
import LiveReports from "@/components/routes/core/reports/live-reports";
import type { RouteItem } from "@/types/core";
import { Archive, FileText} from "lucide-react";

export const CORE_ROUTES: RouteItem[] = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    icon: FileText,
    component: LiveReports,
  },
  {
    name: 'Business Reports',
    link: '/business-reports',
    icon: Archive,
    component: BusinessReports,
  }
]