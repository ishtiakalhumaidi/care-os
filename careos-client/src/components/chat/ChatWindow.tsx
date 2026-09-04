/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  Ban,
  User,
  Check,
  CheckCheck,
  MessageCircle,
  CornerUpLeft,
  X,
  ArrowDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/providers/SocketProvider";
import { getConversationMessages } from "@/services/message.services";
import Image from "next/image";

/* ─── utils ─── */
const formatLastSeen = (dateString?: string, isOnline?: boolean) => {
  if (isOnline) return "Online now";
  if (!dateString) return "Offline";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const formatNameWithRole = (name: string, role: string) => {
  if (!name) return "Unknown";
  const first = name.split(" ")[0];
  if (!role) return first;
  const fmt = role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return `${first} · ${fmt}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDayLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const GROUP_WINDOW_MS = 5 * 60 * 1000;

interface ReplyInfo {
  id: string;
  content: string;
  senderName: string;
  senderId: string;
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
  const [replyingTo, setReplyingTo] = useState<ReplyInfo | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ─── data ─── */
  const cachedConversations = queryClient.getQueryData(["my-conversations"]) as any[];
  const activeConv = cachedConversations?.find((c: any) => c.id === conversationId);
  const isDM = !!activeConv?.isDirectMessage;

  const { data, isLoading } = useQuery({
    queryKey: ["messages", conversationId, limit],
    queryFn: () => getConversationMessages(conversationId, limit).then((res) => res.data as any[]),
    refetchOnMount: "always",
  });

  const messages = useMemo(() => data || [], [data]);

  const resolveReply = useCallback(
    (replyToId?: string, directReplyTo?: any) => {
      if (!replyToId) return null;
      
      const target = messages.find((m: any) => m.id === replyToId);
      if (target) {
        return {
          id: target.id,
          content: target.content,
          sender: target.sender,
          senderId: target.senderId,
        };
      }
      
      if (directReplyTo) {
        return {
          ...directReplyTo,
          senderId: directReplyTo.senderId,
        };
      }
      return null;
    },
    [messages]
  );

  /* ─── partner status ─── */
  const baseStatuses = useMemo(() => {
    const s: Record<string, { isOnline: boolean; lastActiveAt: string }> = {};
    messages.forEach((msg: any) => {
      if (msg.sender && msg.senderId !== currentUserId) {
        s[msg.senderId] = { isOnline: msg.sender.isOnline, lastActiveAt: msg.sender.lastActiveAt };
      }
    });
    return s;
  }, [messages, currentUserId]);

  const [liveStatuses, setLiveStatuses] = useState(baseStatuses);
  const getStatus = (uid: string) => liveStatuses[uid] ?? baseStatuses[uid] ?? { isOnline: false, lastActiveAt: "" };

  const dmPartner = useMemo(() => {
    if (!isDM) return null;
    if (activeConv?.participants) {
      return activeConv.participants.find((p: any) => p.id !== currentUserId) || null;
    }
    const msg = [...messages].reverse().find((m: any) => m.senderId !== currentUserId);
    return msg?.sender || null;
  }, [messages, currentUserId, isDM, activeConv]);

  /* ─── message grouping (messages with replies NEVER group so quotes remain visible) ─── */
  const decoratedMessages = useMemo(() => {
    return messages.map((msg: any, idx: number) => {
      const prev = idx > 0 ? messages[idx - 1] : null;
      const showDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
      const isGrouped =
        !msg.replyToId &&
        !!prev &&
        !showDay &&
        prev.senderId === msg.senderId &&
        !prev.isDeleted &&
        !msg.isDeleted &&
        new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;
      return { ...msg, __showDay: showDay, __grouped: isGrouped };
    });
  }, [messages]);

  /* ─── scroll helpers ─── */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const scrollToMessage = useCallback((msgId?: string) => {
    if (!msgId) return;
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 1800);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBtn(!nearBottom);
  }, []);

  const lastCountRef = useRef(0);
  useEffect(() => {
    const isFirstLoad = lastCountRef.current === 0 && messages.length > 0;
    const hasNew = messages.length > lastCountRef.current;
    if (isFirstLoad) {
      setTimeout(() => scrollToBottom("auto"), 60);
    } else if (hasNew && !showScrollBtn) {
      setTimeout(() => scrollToBottom("smooth"), 30);
    }
    lastCountRef.current = messages.length;
  }, [messages.length, showScrollBtn, scrollToBottom]);

  useEffect(() => {
    lastCountRef.current = 0;
  }, [conversationId]);

  /* ─── socket listeners ─── */
  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit("join_conversation", conversationId);
    socket.emit("mark_read", { conversationId });

    const onNew = (newMsg: any) => {
      if (newMsg.senderId !== currentUserId) {
        setLiveStatuses((p) => ({
          ...p,
          [newMsg.senderId]: { isOnline: true, lastActiveAt: new Date().toISOString() },
        }));
        queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
          if (!old) return old;
          return old.map((m: any) => (m.senderId === currentUserId && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m));
        });
      }
      queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
        const msgs = old || [];
        const filtered = msgs.filter((m: any) => !(m.id.startsWith("temp-") && m.content === newMsg.content));
        if (filtered.some((m: any) => m.id === newMsg.id)) return filtered;
        return [...filtered, newMsg];
      });
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      if (newMsg.senderId !== currentUserId) socket.emit("mark_read", { conversationId });
    };

    const onUpdate = (upd: any) => {
      queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
        if (!old) return old;
        return old.map((m: any) => (m.id === upd.id ? upd : m));
      });
    };

    const onStatus = ({ userId, isOnline, lastActiveAt }: any) => {
      setLiveStatuses((p) => ({ ...p, [userId]: { isOnline, lastActiveAt } }));
    };

    const onRead = ({ conversationId: cid }: any) => {
      if (cid !== conversationId) return;
      queryClient.setQueryData(["messages", conversationId, limit], (old: any) => {
        if (!old) return old;
        return old.map((m: any) => (m.senderId === currentUserId && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m));
      });
    };

    socket.on("new_message", onNew);
    socket.on("message_deleted", onUpdate);
    socket.on("message_edited", onUpdate);
    socket.on("user_status_changed", onStatus);
    socket.on("messages_read", onRead);

    return () => {
      socket.off("new_message", onNew);
      socket.off("message_deleted", onUpdate);
      socket.off("message_edited", onUpdate);
      socket.off("user_status_changed", onStatus);
      socket.off("messages_read", onRead);
    };
  }, [socket, isConnected, conversationId, queryClient, currentUserId, limit]);

  /* ─── click outside menu ─── */
  useEffect(() => {
    if (!activeMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeMenuId]);

  /* ─── actions ─── */
  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setInputText("");
  }, []);

  const startEdit = (msg: any) => {
    setEditingMessageId(msg.id);
    setInputText(msg.content);
    setReplyingTo(null);
    setActiveMenuId(null);
    inputRef.current?.focus();
  };

  const startReply = (msg: any) => {
    const name = msg.senderId === currentUserId ? "Yourself" : msg.sender?.name || "Staff";
    setReplyingTo({ id: msg.id, content: msg.content, senderName: name, senderId: msg.senderId });
    setEditingMessageId(null);
    setActiveMenuId(null);
    inputRef.current?.focus();
  };

 const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    if (editingMessageId) {
      socket.emit("edit_message", {
        conversationId,
        messageId: editingMessageId,
        newContent: inputText.trim(),
      });
      setEditingMessageId(null);
    } else {
      const text = inputText.trim();
      const optimistic = {
        id: `temp-${Date.now()}`,
        content: text,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
        sender: { name: "You", role: "USER" },
        readAt: null,
        replyToId: replyingTo?.id || null,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              content: replyingTo.content,
              senderId: replyingTo.senderId,
              sender: { name: replyingTo.senderName },
            }
          : null,
      };

      queryClient.setQueryData(["messages", conversationId, limit], (old: any) => [...(old || []), optimistic]);
      socket.emit("send_message", {
        conversationId,
        content: text,
        replyToId: replyingTo?.id || undefined,
      });
      setReplyingTo(null);
    }
    setInputText("");
  };

  const handleDelete = (messageId: string) => {
    socket?.emit("delete_message", { conversationId, messageId });
    setActiveMenuId(null);
  };

  /* ─── keyboard escape ─── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeMenuId) setActiveMenuId(null);
        else if (editingMessageId) cancelEdit();
        else if (replyingTo) setReplyingTo(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeMenuId, editingMessageId, replyingTo, cancelEdit]);

  /* ─── textarea auto-resize ─── */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [inputText]);

  return (
    <div className="relative flex h-full flex-col bg-card">
      {/* ─── Header ─── */}
      {isDM && dmPartner && (
        <div className="sticky top-0 z-20 flex min-h-[60px] items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              {dmPartner.image ? (
                <Image src={dmPartner.image} alt={dmPartner.name} width={40} height={40} className="size-10 rounded-full border border-border object-cover shadow-sm" />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>
              )}
              {getStatus(dmPartner.id).isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-card bg-emerald-500">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{dmPartner.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {getStatus(dmPartner.id).isOnline
                  ? "Online now"
                  : formatLastSeen(getStatus(dmPartner.id).lastActiveAt, false)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                isConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {isConnected ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      )}

      {/* ─── Messages Area ─── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4 sm:px-5"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 900px 500px at 15% -10%, color-mix(in srgb, var(--primary) 5%, transparent), transparent), radial-gradient(ellipse 800px 500px at 100% 110%, color-mix(in srgb, var(--primary) 4%, transparent), transparent)",
          backgroundColor: "var(--background)",
        }}
      >
        {isLoading && limit === 50 ? (
          <div className="space-y-4 px-1 pt-2">
            {[1, 0, 0, 1, 1, 0].map((right, i) => (
              <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[75%] gap-2 ${right ? "flex-row-reverse" : ""}`}>
                  {!right && <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />}
                  <div className="space-y-1.5">
                    <div className={`h-3 w-16 animate-pulse rounded bg-muted ${right ? "ml-auto" : ""}`} />
                    <div className={`h-10 animate-pulse rounded-2xl bg-muted ${right ? "w-40 rounded-br-sm" : "w-52 rounded-bl-sm"}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <MessageCircle className="size-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No messages yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Send a message to start the conversation.</p>
            </div>
          </motion.div>
        ) : (
          <>
            {messages.length >= limit && (
              <div className="mb-5 flex justify-center">
                <button
                  onClick={() => setLimit((p) => p + 50)}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                >
                  Load older messages
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {decoratedMessages.map((msg: any) => {
                const isMe = msg.senderId === currentUserId;
                const isSending = msg.id.startsWith("temp-");
                const senderOnline = !isMe && getStatus(msg.senderId).isOnline;
                const replyData = resolveReply(msg.replyToId, msg.replyTo);

                const dayDivider = msg.__showDay ? (
                  <div className="my-5 flex items-center justify-center">
                    <span className="rounded-full bg-card px-4 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm ring-1 ring-border">
                      {formatDayLabel(msg.createdAt)}
                    </span>
                  </div>
                ) : null;

                if (msg.isDeleted) {
                  return (
                    <React.Fragment key={msg.id}>
                      {dayDivider}
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full gap-2 ${isMe ? "justify-end" : "justify-start"} ${msg.__grouped ? "mt-1" : "mt-3"}`}
                      >
                        {!isMe && <div className="w-8 shrink-0" />}
                        <div
                          className={`flex items-center gap-1.5 rounded-2xl border border-foreground/5 bg-foreground/[0.02] px-3.5 py-2 text-[13px] text-muted-foreground/70 shadow-sm backdrop-blur-sm ${
                            isMe ? "rounded-br-sm" : "rounded-bl-sm"
                          }`}
                        >
                          <Ban className="size-3.5 shrink-0 opacity-40" />
                          <span className="italic">
                            {isMe ? "You unsent a message" : `${msg.sender?.name || "Someone"} unsent a message`}
                          </span>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={msg.id}>
                    {dayDivider}

                    <motion.div
                      id={`msg-${msg.id}`}
                      initial={isSending ? { opacity: 0, y: 10, scale: 0.97 } : false}
                      animate={{ opacity: isSending ? 0.7 : 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                      className={`group flex w-full gap-2 transition-all duration-300 ${
                        isMe ? "justify-end" : "justify-start"
                      } ${msg.__grouped ? "mt-1" : "mt-3"} ${
                        highlightedMsgId === msg.id ? "rounded-2xl p-1 ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}
                    >
                      {/* Avatar for incoming */}
                      {!isMe && (
                        <div className="relative w-8 shrink-0 self-end">
                          {!msg.__grouped && (
                            <>
                              {msg.sender?.image ? (
                                <Image src={msg.sender.image} alt={msg.sender.name} width={32} height={32} className="size-8 rounded-full border border-border object-cover" />
                              ) : (
                                <div className="flex size-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                  <User className="size-4" />
                                </div>
                              )}
                              {senderOnline && <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />}
                            </>
                          )}
                        </div>
                      )}

                      <div className={`flex max-w-[82%] flex-col sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                        {/* Sender name for incoming */}
                        {!isMe && !msg.__grouped && !replyData && (
                          <span className="mb-1 ml-1 text-[10px] font-semibold text-muted-foreground">
                            {formatNameWithRole(msg.sender?.name, msg.sender?.role)}
                          </span>
                        )}

                        {/* ─── Messenger-Style External Reply Context ─── */}
                        {replyData && (
                          <div className={`mb-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && !msg.__grouped && (
                              <span className="mb-1 ml-1 text-[10px] font-semibold text-muted-foreground">
                                {formatNameWithRole(msg.sender?.name, msg.sender?.role)}
                              </span>
                            )}
                            <div className="mb-0.5 flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground">
                              <CornerUpLeft className="size-3" />
                              <span>
                                {isMe
                                  ? (replyData.senderId === currentUserId || replyData.sender?.name === "You" || replyData.sender?.name === "Yourself"
                                      ? "You replied to yourself"
                                      : `You replied to ${replyData.sender?.name || "someone"}`)
                                  : (replyData.senderId === currentUserId
                                      ? `${msg.sender?.name} replied to you`
                                      : replyData.senderId === msg.senderId
                                      ? `${msg.sender?.name} replied to themselves`
                                      : `${msg.sender?.name} replied to ${replyData.sender?.name || "someone"}`)
                                }
                              </span>
                            </div>
                            <div
                              onClick={() => scrollToMessage(replyData.id)}
                              className={`group/quote flex max-w-[92%] cursor-pointer select-none items-stretch gap-2.5 overflow-hidden rounded-xl border py-1.5 pr-3.5 transition-colors ${
                                isMe
                                  ? "border-primary/15 bg-primary/[0.06] hover:bg-primary/[0.09]"
                                  : "border-border bg-muted/50 hover:bg-muted"
                              }`}
                            >
                              <span className={`w-[3px] shrink-0 rounded-full ${isMe ? "bg-primary/50" : "bg-muted-foreground/40"}`} />
                              <div className="min-w-0 py-0.5">
                                <p className={`flex items-center gap-1 text-[11px] font-semibold ${isMe ? "text-primary" : "text-foreground/80"}`}>
                                  <CornerUpLeft className="size-2.5 opacity-70" />
                                  {isMe
                                    ? (replyData.senderId === currentUserId || replyData.sender?.name === "You" || replyData.sender?.name === "Yourself"
                                        ? "You"
                                        : replyData.sender?.name || "Someone")
                                    : (replyData.senderId === currentUserId
                                        ? "You"
                                        : replyData.senderId === msg.senderId
                                        ? replyData.sender?.name || "Them"
                                        : replyData.sender?.name || "Someone")
                                  }
                                </p>
                                <p className="line-clamp-1 text-[12px] text-muted-foreground">{replyData.content || "Original message"}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interactive Message Row: Bubble & Side Actions */}
                        <div className="relative flex items-center gap-1.5">
                          {/* ─── Actions for ME: positioned on the LEFT of my message ─── */}
                          {isMe && !isSending && (
                            <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => startReply(msg)}
                                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95"
                                title="Reply to yourself"
                              >
                                <CornerUpLeft className="size-3.5" />
                              </button>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95"
                                  title="More actions"
                                >
                                  <MoreVertical className="size-3.5" />
                                </button>
                                <AnimatePresence>
                                  {activeMenuId === msg.id && (
                                    <motion.div
                                      ref={menuRef}
                                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                      transition={{ duration: 0.12 }}
                                      className="absolute bottom-8 right-0 z-30 w-36 overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
                                    >
                                      <button
                                        onClick={() => startEdit(msg)}
                                        className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-foreground transition-colors hover:bg-muted"
                                      >
                                        <Edit2 className="size-3.5" /> Edit
                                      </button>
                                      <div className="h-px bg-border" />
                                      <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
                                      >
                                        <Trash2 className="size-3.5" /> Delete
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          )}

                          {/* ─── Message Bubble ─── */}
                          <div
                            className={`relative min-w-[4rem] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm ${
                              isMe
                                ? `bg-primary text-primary-foreground ${!msg.__grouped ? "rounded-br-sm" : ""}`
                                : `border border-border/70 bg-card text-foreground ${!msg.__grouped ? "rounded-bl-sm" : ""}`
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            {msg.isEdited && <span className="ml-1.5 align-top text-[9px] italic opacity-60">(edited)</span>}
                          </div>

                          {/* ─── Actions for OTHER PERSON: positioned on the RIGHT of their message ─── */}
                          {!isMe && !isSending && (
                            <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => startReply(msg)}
                                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95"
                                title="Reply to message"
                              >
                                <CornerUpLeft className="size-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Read receipts */}
                        <div className="mt-0.5 flex items-center gap-1.5 px-1">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && !isSending && (
                            <span className="text-muted-foreground">
                              {msg.readAt ? <CheckCheck className="size-3 text-primary" /> : <Check className="size-3" />}
                            </span>
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

      {/* ─── Scroll to bottom ─── */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-24 right-5 z-20 flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted"
          >
            <ArrowDown className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Messenger-Style Reply Context & Input Bar ─── */}
      <div className="border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-3 overflow-hidden pt-2 sm:mx-4"
            >
              <div className="flex items-stretch gap-2.5 overflow-hidden rounded-xl border border-primary/15 bg-primary/[0.06] py-1.5 pl-0 pr-2">
                <span className="w-[3px] shrink-0 rounded-full bg-primary/50" />
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <CornerUpLeft className="size-2.5" />
                    Replying to {replyingTo.senderName === "You" || replyingTo.senderName === "Yourself" ? "yourself" : replyingTo.senderName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{replyingTo.content}</p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="flex size-6 shrink-0 items-center justify-center self-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {editingMessageId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 overflow-hidden border-b border-primary/20"
            >
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold text-primary">Editing message</span>
                <button onClick={cancelEdit} className="text-[11px] text-muted-foreground hover:text-foreground hover:underline">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex items-end gap-3 p-3 sm:p-4">
          <div className="flex min-h-[44px] flex-1 items-end rounded-[22px] border border-input bg-background px-4 shadow-sm transition-shadow focus-within:ring-1 focus-within:ring-primary/20">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={isConnected ? "Type a message…" : "Reconnecting…"}
              rows={1}
              disabled={!isConnected}
              className="custom-scrollbar max-h-[120px] w-full resize-none bg-transparent py-3 text-[14px] leading-snug text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || !isConnected}
            className="mb-[2px] flex size-[40px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow active:scale-95 disabled:opacity-40 disabled:active:scale-100"
          >
            <Send className="ml-0.5 size-[18px]" />
          </button>
        </form>
      </div>
    </div>
  );
}