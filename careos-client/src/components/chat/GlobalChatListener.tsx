/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { useSocket } from "@/providers/SocketProvider";
import { useChat } from "@/components/providers/ChatContext";
import { getMe } from "@/services/user.services";
import { User } from "lucide-react";

export default function GlobalChatListener() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { isDrawerOpen, openDrawer } = useChat();

  const isDrawerOpenRef = useRef(isDrawerOpen);
  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  /* ─── title badge tracking ─── */
  const originalTitleRef = useRef<string>("");
  const unreadCountRef = useRef(0);

  useEffect(() => {
    if (typeof document !== "undefined" && !originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }
  }, []);

  const updateTitleBadge = useCallback((count: number) => {
    if (typeof document === "undefined") return;
    document.title = count > 0 ? `(${count}) ${originalTitleRef.current}` : originalTitleRef.current;
  }, []);

  /* ─── lazily-created, reused notification sound ─── */
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const playNotificationSound = useCallback(() => {
    try {
      if (!notificationAudioRef.current) {
        notificationAudioRef.current = new Audio("/sounds/notification-soft.mp3");
        notificationAudioRef.current.volume = 0.3;
      }
      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.play().catch(() => {});
    } catch {
      /* ignore audio errors */
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return;

    const handleNewMessage = (newMessage: any) => {
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", newMessage.conversationId] });

      if (newMessage.senderId !== user.id && !isDrawerOpenRef.current) {
        const senderName = newMessage.sender?.name || "New Message";
        const snippet =
          newMessage.content.length > 50
            ? newMessage.content.substring(0, 50) + "…"
            : newMessage.content;

        unreadCountRef.current += 1;
        updateTitleBadge(unreadCountRef.current);

        toast.custom(
          (t) => (
            <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xl">
              {/* Avatar */}
              <div className="shrink-0">
                {newMessage.sender?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={newMessage.sender.image}
                    alt={senderName}
                    className="size-10 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <User className="size-4" />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {senderName}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {snippet}
                </p>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  const isDashboard = pathname.includes("/dashboard");
                  if (!isDashboard) {
                    router.push(`/${user.role.toLowerCase()}/dashboard?action=open-chat`);
                  } else {
                    openDrawer();
                  }
                  toast.dismiss(t);
                }}
                className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Open Chat
              </button>
            </div>
          ),
          { duration: 6000 }
        );

        playNotificationSound();
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && isDrawerOpenRef.current) {
        unreadCountRef.current = 0;
        updateTitleBadge(0);
      }
    };

    socket.on("new_message", handleNewMessage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      socket.off("new_message", handleNewMessage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [socket, isConnected, user?.id, queryClient, router, pathname, openDrawer, updateTitleBadge, playNotificationSound]);

  /* reset badge when drawer opens */
  useEffect(() => {
    if (isDrawerOpen && unreadCountRef.current > 0) {
      unreadCountRef.current = 0;
      updateTitleBadge(0);
    }
  }, [isDrawerOpen, updateTitleBadge]);

  return null;
}