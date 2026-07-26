import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useURLParamsFilter from "./useURLParamsFilter";

const filterSchema = z.object({
  user_type: z.enum(["default", "internal", "external"]),
  client_type: z.enum(["default", "company", "individual"]),
  is_active: z.enum(["default", "true", "false"]),
  created_at_after: z.string().optional(),
  created_at_before: z.string().optional(),
});


type FilterFormValues = z.infer<typeof filterSchema>;

const defaultValues: FilterFormValues = {
  user_type: "default",
  client_type: "default",
  is_active: "default",
  created_at_after: "",
  created_at_before: ""
};

function useUsersFiltersPopover() {
    const { getUrlParams, updateFilters, resetFilters } = useURLParamsFilter();

    const { control, handleSubmit, reset, watch } = useForm<FilterFormValues>({
        resolver: zodResolver(filterSchema),
        defaultValues,
    });

    useEffect(() => {
        const params = getUrlParams();
        reset({
        created_at_after: params.created_at_after ?? "",
        created_at_before: params.created_at_before ?? "",
        user_type: (params.user_type as FilterFormValues["user_type"]) ?? "default",
        client_type: (params.client_type as FilterFormValues["client_type"]) ?? "default",
        is_active: (params.is_active as FilterFormValues["is_active"]) ?? "default",
        });
    }, [getUrlParams, reset]);

    const onSubmit = (values: FilterFormValues) => {
        updateFilters(values);
    };

    const onCancel = () => {
        resetFilters();
        reset(defaultValues);
    };

    return {
        control,
        onCancel,
        onSubmit,
        watch,
        handleSubmit,
        reset,

  }
}

export default useUsersFiltersPopover