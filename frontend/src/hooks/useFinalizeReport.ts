import { useState } from "react";
import useInstanceMutation from "./api/useInstanceMutation";
import { useQueryClient } from "@tanstack/react-query";
import { API_END_POINT } from "@/axios/api";
import { handleAxiosError } from "@/lib/utils";

function useFinalizeReport() {
    const client = useQueryClient()
    const [url, setUrl] = useState<undefined | string>()
    const [open, setOpen] = useState(false)

    const { mutate, isPending } = useInstanceMutation()
    const onFinalize = (id: number, callback?: () => void) => {
        mutate({ url: `/api/reports/${id}/finalize-report/`,
        mode: "create"},
            {
                onSuccess: (url) => {
                    const reportUrl = API_END_POINT + url.url;
                    setUrl(reportUrl);
                    client.invalidateQueries({
                        queryKey: ["reports"],
                    });

                    callback?.();
                    window.open(reportUrl, "_blank", "noopener,noreferrer");
                },
                onError: (e) => handleAxiosError(e),
            }
        );
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