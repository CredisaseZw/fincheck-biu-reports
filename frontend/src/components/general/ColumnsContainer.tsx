
import type React from "react";

interface ColumnsContainerProps {
   marginClass?: string;
   gapClass?: string;
   numberOfCols?: 1 | 2 | 3 | 4 | 5 | 6;
   children: React.ReactNode;
}

const colClassMap: Record<number, string> = {
   1: "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
   2: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2",
   3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3",
   4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
   5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
   6: "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
};

const ColumnsContainer = ({ marginClass = "mt-0", numberOfCols = 2, gapClass = "gap-3",children }: ColumnsContainerProps) => {
    const gridCols = colClassMap[numberOfCols] || colClassMap[3]; 
    return <div className={`${marginClass} grid ${gapClass} ${gridCols}`}>{children}</div>;
};

export default ColumnsContainer;
