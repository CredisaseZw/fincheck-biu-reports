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


