import {Skeleton} from "@/components/ui/skeleton"
import ColumnsContainer from "./ColumnsContainer";

export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ColumnsContainer numberOfCols={3}>
        <Skeleton className="w-full h-8 rounded"/>
        <Skeleton className="w-full h-8 rounded"/>
        <Skeleton className="w-full h-8 rounded"/>
      </ColumnsContainer>
      <Skeleton className="w-full h-8 rounded"/>
      <ColumnsContainer>
        <Skeleton className="w-full h-8 rounded"/>
        <Skeleton className="w-full h-8 rounded"/>
      </ColumnsContainer>
      <Skeleton className="w-full rounded h-15"/>
      
    </div>
  )
}

export function CollapsableTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-row justify-between">
        <Skeleton className="h-3 w-25" />
        <Skeleton className="h-3 w-5" />
      </div>

      <div className="w-full flex border-t border-b border-border/50 p-5 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center border-b border-border/50 last:border-b-0 px-5 py-3 gap-6"
        >
          <Skeleton className="h-5 flex-1 max-w-16" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 flex-1 max-w-12" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start justify-between p-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/40">
        <div className="flex items-center gap-2 px-5 py-3">
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-6" />
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3">
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton (){
  return (
    <ColumnsContainer numberOfCols={3}>
      {
        Array.from({length : 3}).map((_, idx)=>
          <DashboardCardSkeleton
            key ={idx}
          />
        )
      }      
    </ColumnsContainer>
  )
}
