import LiveReports from "@/components/routes/core/live-reports";
import type { RouteItem } from "@/types/core";
import { FileText} from "lucide-react";

export const CORE_ROUTES: RouteItem[] = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    icon: FileText,
    component: LiveReports,
  }
]