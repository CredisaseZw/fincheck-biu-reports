import Reports from "@/components/routes/core/reports-lists";
import type { RouteItem } from "@/types/core";
import { FileText} from "lucide-react";

export const CORE_ROUTES: RouteItem[] = [
  {
    name: 'Reports',
    link: '/reports',
    icon: FileText,
    component: Reports,
  }
]