import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationData } from "@/types/core";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Props {
  paginationData: PaginationData;
  paginationName?: string;
}

export default function Paginator({
  paginationData,
  paginationName = "page",
}: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get(paginationName) ?? 1);

  const nextPage = paginationData?.next
    ? new URL(paginationData.next).searchParams.get("page")
    : null;

  const previousPage = paginationData?.prev
    ? new URL(paginationData.prev).searchParams.get("page")
    : currentPage > 1 ? String((currentPage - 1)) : String(1);


  const goToPage = (page: string | null) => {
    if (!page) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set(paginationName, page);
    navigate({ search: newParams.toString() });
  };

  return (
    <Pagination>
      <PaginationContent className="bg-transparent cursor-pointer">
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={!previousPage}
            onClick={(e) => {
              e.preventDefault();
              goToPage(previousPage);
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>
            {currentPage}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            aria-disabled={!nextPage}
            onClick={(e) => {
              e.preventDefault();
              goToPage(nextPage);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
