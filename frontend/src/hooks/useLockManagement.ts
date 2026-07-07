import { api } from "@/axios/api";
import { handleAxiosError } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";

interface LockState {
  isLocked: boolean;
  lockMessage: string | null;
}

export default function useLockManagement(
  report_id: number | null | undefined,
  enabled: boolean
) {
  const [lockState, setLockState] = useState<LockState>({
    isLocked: false,
    lockMessage: null,
  });
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
        setLockState({ isLocked: false, lockMessage: null });
      })
      .catch((err) => {
        holdsLockRef.current = false;
        setLockState({
          isLocked: true,
          lockMessage: err.response?.data?.detail ?? "Report is locked.",
        });
        handleAxiosError(err);
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
      .then(() => setLockState({ isLocked: false, lockMessage: null }))
      .catch((err) => {
        holdsLockRef.current = false;
        setLockState({
          isLocked: true,
          lockMessage: err.response?.data?.detail ?? "Lock expired.",
        });
      });
  }, [report_id, acquireLock]);

  useEffect(() => {
    if (!enabled || !report_id) return;
    console.log("lock effect (re)running", Date.now());

    acquireLock();
    intervalRef.current = setInterval(heartbeat, 45 * 1000);

    return () => {
      console.log("lock effect cleanup", Date.now());
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseLock();
    };
  }, [enabled, report_id, acquireLock, heartbeat, releaseLock]);

  return {
    isLocked: lockState.isLocked,
    lockMessage: lockState.lockMessage,
    releaseLock,
    acquireLock,
  };
}