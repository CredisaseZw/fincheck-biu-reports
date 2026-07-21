import { useState } from "react";
import useInstanceMutation from "./api/useInstanceMutation";
import { useQueryClient } from "@tanstack/react-query";
import { handleAxiosError } from "@/lib/utils";

function useFinalizeReport(callBack?:()=> void) {
    const client = useQueryClient()
    const [url, setUrl] = useState<undefined | string>()
    const [open, setOpenState] = useState(false)

    const { mutate, isPending } = useInstanceMutation()

    const onFinalize = (id: number) => {
        mutate({ url: `/api/reports/${id}/finalize-report/`,
        mode: "create"},
            {
                onSuccess: (data) => {
                    setUrl(data.url);
                    setOpenState(true);
                },
                onError: (e) => handleAxiosError(e),
            }
        );
    };

    const setOpen = (next: boolean) => {
        setOpenState(next);
        if (!next && url) {
            client.invalidateQueries({ queryKey: ["reports"] });
            callBack?.()
        }
    };

    return {
        isPending,
        onFinalize,
        open,
        setOpen,
        url
  }
}

export default useFinalizeReport