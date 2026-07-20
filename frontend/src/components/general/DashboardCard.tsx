import { Clock3, CheckCheck, type LucideIcon } from "lucide-react";

interface props {
    label : string
    active: number;
    finalized: number;
    Icon: LucideIcon
}

function DashboardCard({ label, active, finalized, Icon }: props) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{active + finalized}</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/40">
        <div className="flex items-center gap-2 px-5 py-3">
          <Clock3 className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-primary font-medium">Active</p>
            <p className="text-sm font-semibold text-foreground">{active}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3">
          <CheckCheck className="h-4 w-4 text-green-600 shrink-0" />
          <div>
            <p className="text-xs text-green-600 font-medium">Finalised</p>
            <p className="text-sm font-semibold text-foreground">{finalized}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;