import Reports from "@/components/routes/core/reports-lists";
import ChangePassword from "@/components/routes/core/users/change-password";
import type { RouteItem } from "@/types/core";
import { FileText, KeyRound} from "lucide-react";

export const CORE_ROUTES: RouteItem[] = [
  {
    name: 'Reports',
    link: '/reports',
    icon: FileText,
    component: Reports,
  },
  {
    name: 'Change Password',
    link: '/user-management/change-password',
    icon: KeyRound,
    component: ChangePassword,
   },
]