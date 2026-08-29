/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { useSocket } from "@/providers/SocketProvider";
import { useChat } from "@/components/providers/ChatContext";
import { getMe } from "@/services/user.services";

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
        const snippet = newMessage.content.length > 40 
          ? newMessage.content.substring(0, 40) + "..." 
          : newMessage.content;

      toast(senderName, {
          description: snippet,
          action: {
            label: "Open Chat",
            onClick: () => {
              const isDashboard = pathname.includes("/dashboard");
              
              if (!isDashboard) {
                router.push(`/${user.role.toLowerCase()}/dashboard?action=open-chat`);
              } else {
                openDrawer();
              }
            },
          },
        });
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, isConnected, user?.id, queryClient, router, pathname]);

  return null;
}