/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { acknowledgeBroadcast } from "@/services/broadcast.services";
import { getMe } from "@/services/user.services"; 
import { ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalBroadcastListener() {
  const { socket, isConnected } = useSocket();
  const [criticalBroadcast, setCriticalBroadcast] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: acknowledge, isPending } = useMutation({
    mutationFn: acknowledgeBroadcast,
    onSuccess: () => {
      toast.success("Acknowledgment recorded. Stay safe.");
      setCriticalBroadcast(null);
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to acknowledge. Please try again.");
    }
  });

useEffect(() => {
    if (!socket || !isConnected || !user) return;

    const tenantId = user.tenantId;
    let branchId = user.branch?.id; 
    
    let classroomIds: string[] = [];
    if (user.classroom) {
      classroomIds = Array.isArray(user.classroom) 
        ? user.classroom.map((c: any) => c.id) 
        : [user.classroom.id];
    }

    if (user.role === "GUARDIAN" && user.guardianProfile) {
      const firstChild = user.guardianProfile[0]?.child;
      if (firstChild) branchId = firstChild.branch?.id; 
      
      classroomIds = user.guardianProfile
        .map((g: any) => g.child?.classroom?.id) 
        .filter(Boolean); 
    }

    socket.emit("authenticate_user", {
      id: user.id,
      tenantId,
      branchId,
      classroomIds,
    });

    const handleNewBroadcast = (broadcast: any) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });


      if (broadcast.priority === "CRITICAL") {
        setCriticalBroadcast(broadcast);
      } else if (broadcast.priority === "WARNING") {
        toast.warning(broadcast.title, { description: broadcast.body, duration: 10000 });
      } else {
        toast.info(broadcast.title, { description: broadcast.body });
      }
    };

    socket.on("new_broadcast", handleNewBroadcast);

    return () => {
      socket.off("new_broadcast", handleNewBroadcast);
    };
  }, [socket, isConnected, queryClient, pathname, user]);

  if (!criticalBroadcast) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-2xl bg-destructive p-6 shadow-2xl text-destructive-foreground animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-5">
          
          <div className="rounded-full bg-white/20 p-4">
            <ShieldAlert className="size-14 animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold uppercase tracking-widest text-white">
            Critical Alert
          </h1>
          
          <div className="bg-black/20 rounded-xl p-5 w-full text-left space-y-2 border border-white/10">
            <h2 className="text-lg font-semibold text-white">{criticalBroadcast.title}</h2>
            <p className="text-sm/relaxed text-white/90 whitespace-pre-wrap">
              {criticalBroadcast.body}
            </p>
          </div>
          
          <p className="text-xs font-medium text-white/80 pt-2 uppercase tracking-wider">
            This message requires mandatory acknowledgment
          </p>

          <button
            onClick={() => acknowledge(criticalBroadcast.id)}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-bold text-destructive transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
            {isPending ? "Recording..." : "I Acknowledge / I Am Safe"}
          </button>
        </div>
      </div>
    </div>
  );
}