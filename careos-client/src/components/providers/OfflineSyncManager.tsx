"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { WifiOff, Wifi } from "lucide-react";
import { getOfflineQueue, removeOfflineAction } from "@/utils/offlineQueue.util";
import { confirmCheckIn, confirmCheckOut } from "@/services/attendance.services";
import { useQueryClient } from "@tanstack/react-query";

export default function OfflineSyncManager({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !navigator.onLine;
    }
    return false;
  });

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      toast("You are offline", {
        description: "Don't worry, check-ins will be saved and synced later.",
        icon: <WifiOff className="text-destructive size-4" />
      });
    };

    const handleOnline = async () => {
      setIsOffline(false);
      
      const queue = getOfflineQueue();
      if (queue.length === 0) return;

      toast.info(`Back online. Syncing ${queue.length} saved actions...`, {
        icon: <Wifi className="text-emerald-500 size-4" />
      });

      let successCount = 0;
      for (const action of queue) {
        try {
          if (action.type === "CONFIRM_CHECKIN") {
            await confirmCheckIn(action.attendanceId, action.timestamp);
          } else if (action.type === "CONFIRM_CHECKOUT") {
            await confirmCheckOut(action.attendanceId, action.payload?.guardianId, action.timestamp);
          }
          removeOfflineAction(action.id);
          successCount++;
        } catch (error) {
          console.error("Failed to sync action", action, error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully synced ${successCount} actions!`);
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [queryClient]);

  return (
    <>
      {isOffline && (
        <div className="bg-amber-500 text-black px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
          <WifiOff className="size-3" />
          Working Offline. Data is being saved to this device.
        </div>
      )}
      {children}
    </>
  );
}