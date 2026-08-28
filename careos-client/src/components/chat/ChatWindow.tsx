/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, MoreVertical, Edit2, Trash2, Ban } from "lucide-react";
import { useSocket } from "@/providers/SocketProvider";
import { getConversationMessages } from "@/services/message.services";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      getConversationMessages(conversationId).then((res) => res.data as any[]),
  });

  const messages = useMemo(() => data || [], [data]);

  // Find the last person who sent a message in this room (who isn't you)
  const otherUser = useMemo(() => {
    const msg = [...messages]
      .reverse()
      .find((m: any) => m.senderId !== currentUserId);
    return msg?.sender || null;
  }, [messages, currentUserId]);

  // Track their live status locally
  const [liveStatus, setLiveStatus] = useState<{
    isOnline: boolean;
    lastActiveAt: string;
  } | null>(null);

  useEffect(() => {
    if (otherUser) {
      const timer = setTimeout(() => {
        setLiveStatus({
          isOnline: otherUser.isOnline,
          lastActiveAt: otherUser.lastActiveAt,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [otherUser]);

  useEffect(() => {
    const timer = setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("join_conversation", conversationId);
    socket.emit("mark_read", { conversationId });

    const handleNewMessage = (newMessage: any) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        const msgs = old || [];
        const filtered = msgs.filter(
          (m: any) =>
            !(m.id.startsWith("temp-") && m.content === newMessage.content),
        );
        if (filtered.some((m: any) => m.id === newMessage.id)) return filtered;
        return [...filtered, newMessage];
      });
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      if (newMessage.senderId !== currentUserId)
        socket.emit("mark_read", { conversationId });
    };

    const handleUpdateMessage = (updatedMsg: any) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;
        return old.map((m: any) => (m.id === updatedMsg.id ? updatedMsg : m));
      });
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    };

    const handleStatusUpdate = ({ userId, isOnline, lastActiveAt }: any) => {
      // Only update the UI if the status change belongs to the person we are tracking
      if (otherUser && userId === otherUser.id) {
        setLiveStatus({ isOnline, lastActiveAt });
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_deleted", handleUpdateMessage);
    socket.on("message_edited", handleUpdateMessage);
    socket.on("user_status_changed", handleStatusUpdate); // Listen for live presence

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_deleted", handleUpdateMessage);
      socket.off("message_edited", handleUpdateMessage);
      socket.off("user_status_changed", handleStatusUpdate);
    };
  }, [
    socket,
    isConnected,
    conversationId,
    queryClient,
    currentUserId,
    otherUser,
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
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
      const messageText = inputText.trim();
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        content: messageText,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
        sender: { name: "You", role: "USER" },
      };

      queryClient.setQueryData(["messages", conversationId], (old: any) => [
        ...(old || []),
        optimisticMsg,
      ]);
      socket.emit("send_message", { conversationId, content: messageText });
    }
    setInputText("");
  };

  const handleDelete = (messageId: string) => {
    socket?.emit("delete_message", { conversationId, messageId });
    setActiveDropdown(null);
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Dynamic Status Header */}
      <div className="px-4 py-1.5 border-b border-border flex items-center justify-between shadow-sm z-10 min-h-[36px]">
        {liveStatus && otherUser ? (
          <span className="text-[11px] font-medium flex items-center gap-1.5 text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${liveStatus.isOnline ? "bg-emerald-500" : "bg-muted-foreground/50"}`}
            ></span>
            {otherUser.name}:{" "}
            {formatLastSeen(liveStatus.lastActiveAt, liveStatus.isOnline)}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground italic">
            Waiting for a reply...
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center">
            No messages yet.
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.senderId === currentUserId;
            const isSending = msg.id.startsWith("temp-");

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isSending ? "opacity-70" : ""}`}
              >
                <span className="mb-1 text-[10px] text-muted-foreground px-1 font-medium">
                  {isMe ? "You" : msg.sender?.name} •{" "}
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <div
                  className={`relative group max-w-[85%] flex ${isMe ? "flex-row-reverse" : "flex-row"} items-center gap-2`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.isDeleted
                        ? "bg-transparent border border-dashed border-border text-muted-foreground flex items-center gap-2"
                        : isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none border border-border"
                    }`}
                  >
                    {msg.isDeleted ? (
                      <span className="italic text-xs flex items-center gap-1.5 opacity-80">
                        <Ban className="size-3.5" />{" "}
                        {isMe ? "You" : msg.sender?.name} removed this message.
                      </span>
                    ) : (
                      <>
                        {msg.content}
                        {msg.isEdited && (
                          <span className="text-[10px] opacity-70 ml-2">
                            (edited)
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {isMe && !msg.isDeleted && !isSending && (
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === msg.id ? null : msg.id,
                          )
                        }
                        className="p-1.5 text-muted-foreground hover:bg-muted rounded-full"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {activeDropdown === msg.id && (
                        <div className="absolute right-0 bottom-8 z-10 w-28 rounded-md border border-border bg-popover shadow-md py-1">
                          <button
                            onClick={() => {
                              setInputText(msg.content);
                              setEditingMessageId(msg.id);
                              setActiveDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted"
                          >
                            <Edit2 className="size-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-border p-3 bg-card"
      >
        {editingMessageId && (
          <div className="flex items-center justify-between mb-2 px-3 text-xs text-primary font-medium bg-primary/5 py-1.5 rounded-md">
            <span>Editing message...</span>
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
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !isConnected}
            className="flex shrink-0 size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="size-4 -ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
