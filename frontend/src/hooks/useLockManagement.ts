import { api } from "@/axios/api";
import { handleAxiosError } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useRef, useState, useCallback } from "react";

export default function useLockManagement(
  report_id: number | null | undefined,
  enabled: boolean
) {
  const [lockState, setLockState] = useState(false);
  const holdsLockRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const client = useQueryClient();

  const acquireLock = useCallback(() => {
    if (!report_id) return;
    api
      .post(`/api/reports/${report_id}/acquire-report-lock/`)
      .then(() => {
        holdsLockRef.current = true;
        client.invalidateQueries({ queryKey: ["reports"] });
        setLockState(false);
      })
      .catch((err:AxiosError) => {
        holdsLockRef.current = false;
        if(err.status === 423){
          setLockState(true);
          handleAxiosError(err);
        }
      });
  }, [report_id, client]);

  const releaseLock = useCallback(() => {
    if (!report_id) return;
    holdsLockRef.current = false;
    api
      .post(`/api/reports/${report_id}/release-report-lock/`)
      .then(() => client.invalidateQueries({ queryKey: ["reports"] }))
      .catch(() => {});
  }, [report_id, client]);

  const heartbeat = useCallback(() => {
    if (!report_id) return;
    if (!holdsLockRef.current) {
      acquireLock();
      return;
    }

    api
      .post(`/api/reports/${report_id}/refresh-dual-lock/`)
      .then(() => setLockState(false))
      .catch((err:AxiosError) => {
        holdsLockRef.current = false;
        if(err.status === 409){
          setLockState(false);
        }
      });
  }, [report_id, acquireLock]);

  useEffect(() => {
    if (!enabled || !report_id) return;
    acquireLock();
    intervalRef.current = setInterval(heartbeat, 45 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseLock();
    };
  }, [enabled, report_id, acquireLock, heartbeat, releaseLock]);

  return {
    isLocked: lockState,
    releaseLock,
    acquireLock,
  };
}