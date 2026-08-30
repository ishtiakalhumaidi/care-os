/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MoreVertical, Edit2, Trash2, Ban, User, Check, CheckCheck, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

// --- Presentational-only helpers (no data fetching, no side effects) ---

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDayLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const GROUP_WINDOW_MS = 5 * 60 * 1000;

function BubbleTail({
  side,
  className,
}: {
  side: "left" | "right";
  className?: string;
}) {
  return side === "left" ? (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className={`absolute -left-[4px] bottom-[2px] ${className}`}
      fill="currentColor"
    >
      <path d="M8 0C8 5 5 8 0 8C3 6 4 3 4 0H8Z" />
    </svg>
  ) : (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className={`absolute -right-[4px] bottom-[2px] ${className}`}
      fill="currentColor"
    >
      <path d="M0 0C0 5 3 8 8 8C5 6 4 3 4 0H0Z" />
    </svg>
  );
}

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

  const [liveStatuses, setLiveStatuses] = useState<Record<string, { isOnline: boolean; lastActiveAt: string }>>({});

  const getParticipantStatus = (userId: string) => {
    return liveStatuses[userId] ?? baseStatuses[userId] ?? { isOnline: false, lastActiveAt: "" };
  };

  const dmPartner = useMemo(() => {
    if (!isDM) return null;
    if (activeConv?.participants) {
      const p = activeConv.participants.find((p: any) => p.id !== currentUserId);
      if (p) return p;
    }
    const msg = [...messages].reverse().find((m: any) => m.senderId !== currentUserId);
    return msg?.sender || null;
  }, [messages, currentUserId, isDM, activeConv]);

  // Presentational-only: derive dayDivider + grouping flags purely from array indices —
  // no mutable variable carried across iterations, safe under the React Compiler.
  const decoratedMessages = useMemo(() => {
    return messages.map((msg: any, idx: number) => {
      const prev = idx > 0 ? messages[idx - 1] : null;

      const showDayDivider =
        !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

      const isGrouped =
        !!prev &&
        !showDayDivider &&
        prev.senderId === msg.senderId &&
        !prev.isDeleted &&
        !msg.isDeleted &&
        new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;

      return { ...msg, __showDayDivider: showDayDivider, __isGrouped: isGrouped };
    });
  }, [messages]);

  const prevMessagesLength = useRef(0);

  useEffect(() => {
    prevMessagesLength.current = 0;
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current && limit === 50) {
      const isFirstLoad = prevMessagesLength.current === 0;
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
    <div className="relative flex h-full flex-col bg-card">
      {isDM && dmPartner && (
        <div className="sticky top-0 z-20 flex min-h-[56px] items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              {dmPartner.image ? (
                <Image src={dmPartner.image} alt={dmPartner.name} width={36} height={36} className="size-9 rounded-full border border-border object-cover" />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
              )}
              {getParticipantStatus(dmPartner.id).isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                  <span className="relative inline-flex size-3 rounded-full border-2 border-card bg-emerald-500" />
                </span>
              )}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">{dmPartner.name}</span>
              <span className="text-[11px] text-muted-foreground">
                {formatLastSeen(getParticipantStatus(dmPartner.id).lastActiveAt, getParticipantStatus(dmPartner.id).isOnline)}
              </span>
            </div>
          </div>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
              isConnected ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
            }`}
          >
            <span className={`size-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
            {isConnected ? "Live" : "Reconnecting"}
          </span>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          color: "var(--border)",
          backgroundColor: "var(--background)",
        }}
      >
        {isLoading && limit === 50 ? (
          <div className="space-y-3">
            {[0, 1, 0, 1, 1, 0].map((right, i) => (
              <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
                <div
                  className={`h-9 animate-pulse rounded-2xl bg-muted ${right ? "w-40 rounded-br-sm" : "w-52 rounded-bl-sm"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageCircle className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">Say hello to get things started.</p>
          </div>
        ) : (
          <>
            {messages.length >= limit && (
              <div className="mb-3 flex justify-center">
                <button
                  onClick={() => setLimit((prev) => prev + 50)}
                  disabled={isFetching}
                  className="rounded-full bg-card px-4 py-1.5 text-[11px] font-medium text-primary shadow-sm ring-1 ring-border transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {isFetching && limit > 50 ? "Loading…" : "Load older messages"}
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {decoratedMessages.map((msg: any) => {
                const isMe = msg.senderId === currentUserId;
                const isSending = msg.id.startsWith("temp-");
                const isSenderOnline = !isMe && getParticipantStatus(msg.senderId).isOnline;
                const senderDisplayName = isMe ? "You" : formatNameWithRole(msg.sender?.name, msg.sender?.role);

                const dayDivider = msg.__showDayDivider ? (
                  <div className="my-4 flex items-center justify-center">
                    <span className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border">
                      {formatDayLabel(msg.createdAt)}
                    </span>
                  </div>
                ) : null;

                if (msg.isDeleted) {
                  return (
                    <React.Fragment key={msg.id}>
                      {dayDivider}
                      <div className="my-1.5 flex w-full justify-center">
                        <div className="flex items-center gap-1.5 rounded-full bg-card/80 px-3.5 py-1.5 text-[11px] italic text-muted-foreground ring-1 ring-border/60">
                          <Ban className="size-3 opacity-60" />
                          {isMe ? "You" : msg.sender?.name} removed a message
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={msg.id}>
                    {dayDivider}
                    <motion.div
                      initial={isSending ? { opacity: 0, y: 8, scale: 0.98 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={`group flex w-full gap-2 ${isMe ? "justify-end" : "justify-start"} ${
                        msg.__isGrouped ? "mt-0.5" : "mt-3"
                      }`}
                    >
                      {!isMe && (
                        <div className="relative w-7 shrink-0 self-end">
                          {!msg.__isGrouped && (
                            <>
                              {msg.sender?.image ? (
                                <Image src={msg.sender.image} alt={msg.sender.name} width={28} height={28} className="size-7 rounded-full border border-border object-cover" />
                              ) : (
                                <div className="flex size-7 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                  <User className="size-3.5" />
                                </div>
                              )}
                              {isSenderOnline && (
                                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <div className={`flex max-w-[72%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && !msg.__isGrouped && (
                          <span className="mb-1 ml-1 text-[10px] font-medium text-muted-foreground">{senderDisplayName}</span>
                        )}

                        <div className={`relative flex items-center gap-1.5 ${isSending ? "opacity-60" : ""}`}>
                          {isMe && !isSending && (
                            <div className="relative opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === msg.id ? null : msg.id)}
                                className="rounded-full p-1.5 text-muted-foreground ring-1 ring-transparent hover:bg-muted hover:ring-border"
                              >
                                <MoreVertical className="size-3.5" />
                              </button>
                              {activeDropdown === msg.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                  <div className="absolute bottom-8 right-0 z-20 w-32 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                                    <button
                                      onClick={() => {
                                        setInputText(msg.content);
                                        setEditingMessageId(msg.id);
                                        setActiveDropdown(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-foreground hover:bg-muted"
                                    >
                                      <Edit2 className="size-3.5" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(msg.id)}
                                      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="size-3.5" /> Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          <div
                            className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                              isMe
                                ? `bg-primary text-primary-foreground ${!msg.__isGrouped ? "rounded-br-md" : ""}`
                                : `border border-border/60 bg-muted text-foreground ${!msg.__isGrouped ? "rounded-bl-md" : ""}`
                            }`}
                          >
                            {!msg.__isGrouped && (
                              <BubbleTail side={isMe ? "right" : "left"} className={isMe ? "text-primary" : "text-muted"} />
                            )}
                            {msg.content}
                            {msg.isEdited && <span className="ml-2 text-[10px] italic opacity-70">(edited)</span>}
                          </div>
                        </div>

                        <div suppressHydrationWarning className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          {isMe && !isSending && (
                            msg.readAt ? (
                              <CheckCheck className="ml-0.5 size-3.5 text-primary" />
                            ) : (
                              <Check className="ml-0.5 size-3.5" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-border bg-card p-3">
        {editingMessageId && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            <span>Editing message…</span>
            <button
              type="button"
              onClick={() => {
                setEditingMessageId(null);
                setInputText("");
              }}
              className="hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-end gap-1.5 rounded-3xl border border-input bg-background px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-primary">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="custom-scrollbar max-h-[120px] min-h-[38px] flex-1 resize-none bg-transparent py-1.5 text-sm focus-visible:outline-none disabled:opacity-50"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !isConnected}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 active:scale-90 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="ml-0.5 size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}