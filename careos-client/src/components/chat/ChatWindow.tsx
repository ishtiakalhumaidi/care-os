/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, MoreVertical, Edit2, Trash2, Ban, User, Check, CheckCheck } from "lucide-react";
import { useSocket } from "@/providers/SocketProvider";
import { getConversationMessages } from "@/services/message.services";
import Image from "next/image";

const formatLastSeen = (dateString?: string, isOnline?: boolean) => {
  if (isOnline) return "Online right now";
  if (!dateString) return "Offline";
  const diffMs = new Date().getTime() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  if (diffMins < 5) return "Active just now";
  if (diffMins < 60) return `Active ${diffMins}m ago`;
  if (diffHrs < 24) return `Active ${diffHrs}h ago`;
  return `Active ${Math.floor(diffHrs / 24)}d ago`;
};

const formatNameWithRole = (name: string, role: string) => {
  if (!name) return "Unknown";
  const firstName = name.split(" ")[0];
  if (!role) return firstName;
  const formattedRole = role.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return `${firstName} (${formattedRole})`;
};

export default function ChatWindow({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Pagination State
  const [limit, setLimit] = useState(50);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const cachedConversations = queryClient.getQueryData(["my-conversations"]) as any[];
  const activeConv = cachedConversations?.find((c: any) => c.id === conversationId);
  const isDM = !!activeConv?.isDirectMessage;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["messages", conversationId, limit],
    queryFn: () => getConversationMessages(conversationId, limit).then((res) => res.data as any[]),
    refetchOnMount: "always",
  });

  const messages = useMemo(() => data || [], [data]);


  const baseStatuses = useMemo(() => {
    const statuses: Record<string, { isOnline: boolean; lastActiveAt: string }> = {};
    messages.forEach((msg: any) => {
      if (msg.sender && msg.senderId !== currentUserId) {
        statuses[msg.senderId] = {
          isOnline: msg.sender.isOnline,
          lastActiveAt: msg.sender.lastActiveAt,
        };
      }
    });
    return statuses;
  }, [messages, currentUserId]);

  // 2. Live Status: Real-time socket overrides
  const [liveStatuses, setLiveStatuses] = useState<Record<string, { isOnline: boolean; lastActiveAt: string }>>({});

  // 3. Helper to merge the two
  const getParticipantStatus = (userId: string) => {
    return liveStatuses[userId] ?? baseStatuses[userId] ?? { isOnline: false, lastActiveAt: "" };
  };
  // ---------------------------------

  const dmPartner = useMemo(() => {
    if (!isDM) return null;
    if (activeConv?.participants) {
      const p = activeConv.participants.find((p: any) => p.id !== currentUserId);
      if (p) return p;
    }
    const msg = [...messages].reverse().find((m: any) => m.senderId !== currentUserId);
    return msg?.sender || null;
  }, [messages, currentUserId, isDM, activeConv]);

  // FIX: Smart Scrolling ensures we always snap to bottom on open
  const prevMessagesLength = useRef(0);

  // Reset length tracker when changing conversations to force a scroll
  useEffect(() => {
    prevMessagesLength.current = 0;
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current && limit === 50) {
      const isFirstLoad = prevMessagesLength.current === 0;
      
      // Use a tiny timeout to ensure the DOM has fully painted the messages before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: isFirstLoad ? "auto" : "smooth" });
      }, 50);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, limit]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("join_conversation", conversationId);
    socket.emit("mark_read", { conversationId });

    const handleNewMessage = (newMessage: any) => {
      if (newMessage.senderId !== currentUserId) {
        setLiveStatuses((prev) => ({
          ...prev,
          [newMessage.senderId]: { isOnline: true, lastActiveAt: new Date().toISOString() },
        }));

        queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
          if (!old) return old;
          return old.map((m: any) =>
            m.senderId === currentUserId && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m
          );
        });
      }

      queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
        const msgs = old || [];
        const filtered = msgs.filter((m: any) => !(m.id.startsWith("temp-") && m.content === newMessage.content));
        if (filtered.some((m: any) => m.id === newMessage.id)) return filtered;
        return [...filtered, newMessage];
      });

      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });

      if (newMessage.senderId !== currentUserId) {
        socket.emit("mark_read", { conversationId });
      }
    };

    const handleUpdateMessage = (updatedMsg: any) => {
      queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
        if (!old) return old;
        return old.map((m: any) => (m.id === updatedMsg.id ? updatedMsg : m));
      });
    };

    const handleStatusUpdate = ({ userId, isOnline, lastActiveAt }: any) => {
      setLiveStatuses((prev) => ({
        ...prev,
        [userId]: { isOnline, lastActiveAt },
      }));
    };

    const handleMessagesRead = ({ conversationId: readConvId }: any) => {
      if (readConvId === conversationId) {
        queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
          if (!old) return old;
          return old.map((m: any) =>
            m.senderId === currentUserId && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m
          );
        });
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_deleted", handleUpdateMessage);
    socket.on("message_edited", handleUpdateMessage);
    socket.on("user_status_changed", handleStatusUpdate);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_deleted", handleUpdateMessage);
      socket.off("message_edited", handleUpdateMessage);
      socket.off("user_status_changed", handleStatusUpdate);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, isConnected, conversationId, queryClient, currentUserId, limit]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    if (editingMessageId) {
      socket.emit("edit_message", { conversationId, messageId: editingMessageId, newContent: inputText.trim() });
      setEditingMessageId(null);
    } else {
      const messageText = inputText.trim();
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        content: messageText,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
        sender: { name: "You", role: "USER" },
        readAt: null,
      };

      queryClient.setQueryData(["messages", conversationId, limit], (old: any) => [...(old || []), optimisticMsg]);
      socket.emit("send_message", { conversationId, content: messageText });
    }
    setInputText("");
  };

  const handleDelete = (messageId: string) => {
    socket?.emit("delete_message", { conversationId, messageId });
    setActiveDropdown(null);
  };

  return (
    <div className="flex h-full flex-col bg-card relative">
      {isDM && dmPartner && (
        <div className="px-4 py-1.5 border-b border-border flex items-center justify-between shadow-sm z-10 min-h-[36px] bg-card/80 backdrop-blur-sm sticky top-0">
          <span className="text-[11px] font-medium flex items-center gap-1.5 text-muted-foreground">
            <span className={`size-1.5 rounded-full ${getParticipantStatus(dmPartner.id).isOnline ? "bg-emerald-500" : "bg-muted-foreground/50"}`}></span>
            {dmPartner.name}: {formatLastSeen(getParticipantStatus(dmPartner.id).lastActiveAt, getParticipantStatus(dmPartner.id).isOnline)}
          </span>
        </div>
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {isLoading && limit === 50 ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center">Start the conversation...</div>
        ) : (
          <>
            {/* Pagination Load More Button */}
            {messages.length >= limit && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setLimit((prev) => prev + 50)}
                  disabled={isFetching}
                  className="text-[11px] font-medium text-primary hover:bg-muted/80 flex items-center gap-1.5 bg-muted/50 px-4 py-1.5 rounded-full transition-colors"
                >
                  {isFetching && limit > 50 ? <Loader2 className="size-3 animate-spin" /> : "Load older messages"}
                </button>
              </div>
            )}

            {messages.map((msg: any) => {
              const isMe = msg.senderId === currentUserId;
              const isSending = msg.id.startsWith("temp-");
              const isSenderOnline = !isMe && getParticipantStatus(msg.senderId).isOnline;
              const senderDisplayName = isMe ? "You" : formatNameWithRole(msg.sender?.name, msg.sender?.role);

              if (msg.isDeleted) {
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} my-2`}>
                    <div className="rounded-full px-4 py-1.5 text-[11px] italic text-muted-foreground bg-muted/50 border border-border/50 flex items-center gap-1.5">
                      <Ban className="size-3 opacity-60" /> {isMe ? "You" : msg.sender?.name} removed a message
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} group`}>
                  {!isMe && (
                    <div className="relative mr-2 self-end shrink-0 mb-5">
                      {msg.sender?.image ? (
                        <Image src={msg.sender.image} alt={msg.sender.name} width={28} height={28} className="size-7 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20"><User className="size-3.5" /></div>
                      )}
                      {isSenderOnline && <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-background shadow-sm"></span>}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                    {!isMe && <span className="text-[10px] text-muted-foreground font-medium ml-1 mb-1">{senderDisplayName}</span>}

                    <div className={`relative flex items-center gap-2 ${isSending ? "opacity-70" : ""}`}>
                      {isMe && !isSending && (
                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setActiveDropdown(activeDropdown === msg.id ? null : msg.id)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full"><MoreVertical className="size-4" /></button>
                          {activeDropdown === msg.id && (
                            <div className="absolute right-0 bottom-8 z-10 w-28 rounded-md border border-border bg-popover shadow-md py-1">
                              <button onClick={() => { setInputText(msg.content); setEditingMessageId(msg.id); setActiveDropdown(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted"><Edit2 className="size-3" /> Edit</button>
                              <button onClick={() => handleDelete(msg.id)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="size-3" /> Delete</button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm border border-border/50"}`}>
                        {msg.content}
                        {msg.isEdited && <span className="text-[10px] opacity-70 ml-2 italic">(edited)</span>}
                      </div>
                    </div>

                    <div 
                    suppressHydrationWarning
                     className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-1">
                     {new Date(msg.createdAt).toLocaleTimeString("en-US", { 
                        hour: "2-digit", minute: "2-digit" 
                      })}
                      {isMe && !isSending && (
                        msg.readAt ? (
                          <span title="Read" className="flex items-center"><CheckCheck className="size-3.5 text-blue-500 ml-0.5" /></span>
                        ) : (
                          <span title="Sent" className="flex items-center"><Check className="size-3.5 ml-0.5" /></span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-border p-3 bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {editingMessageId && (
          <div className="flex items-center justify-between mb-2 px-3 text-xs text-primary font-medium bg-primary/5 py-1.5 rounded-md border border-primary/20">
            <span>Editing message...</span>
            <button type="button" onClick={() => { setEditingMessageId(null); setInputText(""); }} className="hover:underline">Cancel</button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[40px] max-h-[120px] rounded-2xl border border-input bg-background px-4 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 resize-none custom-scrollbar"
            disabled={!isConnected}
          />
          <button type="submit" disabled={!inputText.trim() || !isConnected} className="flex shrink-0 size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95 hover:bg-primary/90 disabled:opacity-50 disabled:active:scale-100">
            <Send className="size-4 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}