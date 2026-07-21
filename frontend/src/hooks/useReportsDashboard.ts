import type { EntityValue, ListCompany, ListIndividual, PaginationData } from "@/types/core";
import { useEffect, useState } from "react";
import useURLParamsFilter from "./useURLParamsFilter";
import useGetEntityList from "./api/useGetEntityList";
import { handleAxiosError } from "@/lib/utils";

function useReportsDashboard() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentSubject, setCurrentSubject] = useState<EntityValue>("company");
  const { getUrlParams, setSingleUrlParam, removeSingleUrlParam } = useURLParamsFilter();
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined)
  const [listData, setListData] = useState<Array<ListCompany | ListIndividual>>([])

  const {
    data,
    isError,
    isLoading,
    error
  } = useGetEntityList();

  useEffect(() => {
    const params = getUrlParams();
    if (params.search) setSearchValue(params.search);
    if (
      params.entity_value &&
      (params.entity_value === "company" || params.entity_value === "individual")
    ) {setCurrentSubject(params.entity_value)}
    else{ setSingleUrlParam("entity_value", currentSubject) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUrlParams]);

  useEffect(()=>{
    if(handleAxiosError(error)) return;
    if(!data) return;

    const {results, ...p} = data
    setPaginationData(p)
    setListData(results)
  }, [error, data])

  const onClear = () =>{
    removeSingleUrlParam("search")
    setSearchValue("")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = searchValue.trim()
    if(!s) return onClear()
    setSingleUrlParam("search", s);
  };

  const handleSubjectChange = (val: EntityValue) => {
    setSingleUrlParam("entity_value", val);
    setCurrentSubject(val);
  };

  return {
    setSearchValue,
    setCurrentSubject: handleSubjectChange,
    handleSearchSubmit,
    onClear,
    currentSubject,
    searchValue,
    listData,
    paginationData,
    isLoading,
    isError,
    error,
    isData : Boolean(data)
  };
}

export default useReportsDashboard;