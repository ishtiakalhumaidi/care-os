/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  MessageSquare, X, ChevronLeft, Loader2, User, Plus,
  Users, ShieldAlert, MessageCircle, Inbox, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSocket } from "@/providers/SocketProvider";
import { useChat } from "@/components/providers/ChatContext";
import {
  getMyConversations,
  getConversationByChild,
  getContacts,
  startDirectMessage,
  startClassroomMessage,
} from "@/services/message.services";
import ChatWindow from "./ChatWindow";
import Image from "next/image";

type TabType = "all" | "direct" | "teams" | "guardians";
type ContactTabType = "direct" | "teams";

const MAIN_TABS: { key: TabType; label: string; icon: any }[] = [
  { key: "all", label: "All", icon: Inbox },
  { key: "direct", label: "Direct", icon: MessageCircle },
  { key: "teams", label: "Teams", icon: Users },
  { key: "guardians", label: "Guardians", icon: ShieldAlert },
];

const CONTACT_TABS: { key: ContactTabType; label: string; icon: any }[] = [
  { key: "direct", label: "Direct", icon: User },
  { key: "teams", label: "Teams", icon: Users },
];

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-muted/70" />
      </div>
    </div>
  );
}

export default function MessagingDrawer({
  currentUserId,
  currentUserRole,
}: {
  currentUserId: string;
  currentUserRole?: string;
}) {
  const { isDrawerOpen, openDrawer, closeDrawer, targetChildId } = useChat();
  const isGuardian = currentUserRole === "GUARDIAN";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("action") === "open-chat") {
      openDrawer();

      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, openDrawer, pathname, router]);

  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [contactTab, setContactTab] = useState<ContactTabType>("direct");
  const [searchQuery, setSearchQuery] = useState(""); 

  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const isDrawerOpenRef = useRef(isDrawerOpen);
  const activeConvIdRef = useRef(activeConv?.id);

  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
    activeConvIdRef.current = activeConv?.id;
  }, [isDrawerOpen, activeConv]);

  useEffect(() => {
    if (targetChildId && isDrawerOpen) {
      const timer = setTimeout(() => setIsInitializing(true), 0);
      getConversationByChild(targetChildId)
        .then((res) => setActiveConv(res.data))
        .catch((err) => console.error("Failed to init chat", err))
        .finally(() => setIsInitializing(false));
      return () => clearTimeout(timer);
    }
  }, [targetChildId, isDrawerOpen]);

  const { data: convData, isLoading: isLoadingConvs } = useQuery({
    queryKey: ["my-conversations"],
    queryFn: () => getMyConversations().then((res) => res.data),
  });

  // Allowed Guardians to fetch contacts so they can DM the Admin/Teacher
  const { data: contactsData, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["message-contacts"],
    queryFn: () => getContacts().then((res) => res.data),
    enabled: showContacts, 
  });

  const { mutate: startDM, isPending: isStartingDM } = useMutation({
    mutationFn: startDirectMessage,
    onSuccess: (res) => {
      setActiveConv(res.data);
      setShowContacts(false);
      setSearchQuery(""); 
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    },
    onError: (err) => console.error("Failed to start DM", err),
  });

  const rawConversations = useMemo(() => convData || [], [convData]);
  const totalUnread = useMemo(
    () => rawConversations.reduce((sum: number, conv: any) => sum + (conv._count?.messages || 0), 0),
    [rawConversations],
  );

  const sortedConversations = useMemo(() => {
    return [...rawConversations].sort((a, b) => {
      const timeA = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : new Date(a.updatedAt).getTime();
      const timeB = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : new Date(b.updatedAt).getTime();
      return timeB - timeA;
    });
  }, [rawConversations]);

  useEffect(() => {
    if (!socket || !isConnected || rawConversations.length === 0) return;

    rawConversations.forEach((conv: any) => {
      socket.emit("join_conversation", conv.id);
    });

    const handleNewMessage = (newMessage: any) => {
      queryClient.setQueryData(["my-conversations"], (old: any) => {
        if (!old) return old;
        return old.map((conv: any) => {
          if (conv.id === newMessage.conversationId) {
            return {
              ...conv,
              updatedAt: new Date().toISOString(),
              messages: [newMessage],
              _count: {
                messages: newMessage.senderId !== currentUserId && activeConvIdRef.current !== conv.id
                  ? (conv._count?.messages || 0) + 1
                  : conv._count?.messages || 0
              }
            };
          }
          return conv;
        });
      });

      queryClient.setQueryData(["messages", newMessage.conversationId], (old: any) => {
        if (!old) return old;
        if (old.some((m: any) => m.id === newMessage.id)) return old;
        const filtered = old.filter((m: any) => !(m.id.startsWith("temp-") && m.content === newMessage.content));
        return [...filtered, newMessage];
      });
    };

    const handleGlobalUpdate = () => queryClient.invalidateQueries({ queryKey: ["my-conversations"] });

    socket.on("new_message", handleNewMessage);
    socket.on("message_deleted", handleGlobalUpdate);
    socket.on("messages_read", handleGlobalUpdate);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_deleted", handleGlobalUpdate);
      socket.off("messages_read", handleGlobalUpdate);
    };
  }, [socket, isConnected, rawConversations, queryClient, currentUserId]);

  const handleClose = () => {
    setActiveConv(null);
    setShowContacts(false);
    setSearchQuery(""); 
    closeDrawer();
  };

  const handleOpenContacts = () => {
    setShowContacts(true);
    setSearchQuery("");
  };

  const handleBackToConversations = () => {
    setActiveConv(null);
    setShowContacts(false);
    setSearchQuery(""); 
  };

  const renderConversationButton = (conv: any) => {
    const isClassroomGroup = !!conv.classroom;
    const isDM = conv.isDirectMessage;
    const dmPartner = isDM ? conv.participants?.find((p: any) => p.id !== currentUserId) : null;

    const lastMsg = conv.messages?.[0];
    const isMe = lastMsg?.senderId === currentUserId;
    const senderName = isMe ? "You" : lastMsg?.sender?.name || "Staff";
    const hasUnread = conv._count?.messages > 0;

    const displayPhoto = isDM ? dmPartner?.image : isClassroomGroup ? null : conv.child?.photoUrl;
    const displayTitle = isClassroomGroup ? `${conv.classroom.name} Team` : isDM ? dmPartner?.name : `${conv.child?.firstName} ${conv.child?.lastName}`;

    return (
      <button
        key={conv.id}
        onClick={() => {
          setActiveConv(conv);
          setSearchQuery("");
        }}
        className="flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-colors hover:bg-muted"
      >
        {displayPhoto ? (
          <Image src={displayPhoto} alt="Profile" width={46} height={46} className="size-[46px] shrink-0 rounded-full border border-border object-cover" />
        ) : (
          <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isClassroomGroup ? <Users className="size-5" /> : <User className="size-5" />}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <span className={`truncate text-sm ${hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
              {!isDM && !isClassroomGroup && !isGuardian && <span className="font-normal text-muted-foreground">Regarding: </span>}
              {displayTitle}
            </span>
            {lastMsg && (
              <span
                suppressHydrationWarning
                className={`shrink-0 whitespace-nowrap text-[10px] ${hasUnread ? "font-bold text-primary" : "text-muted-foreground"}`}
              >
                {new Date(lastMsg.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit"
                })}
              </span>
            )}
          </div>
          <p className={`truncate text-xs ${hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
            {lastMsg ? (
              lastMsg.isDeleted ? (
                <span className="italic opacity-80">Message removed</span>
              ) : (
                <><span className="opacity-75">{senderName}: </span>{lastMsg.content}</>
              )
            ) : (
              <span className="italic opacity-70">Start a conversation</span>
            )}
          </p>
        </div>
        {hasUnread && (
          <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-sm">
            {conv._count.messages}
          </span>
        )}
      </button>
    );
  };

  const displayedConversations = (() => {
    const base = isGuardian
      ? sortedConversations
      : (() => {
          switch (activeTab) {
            case "direct": return sortedConversations.filter((c: any) => c.isDirectMessage);
            case "teams": return sortedConversations.filter((c: any) => !!c.classroom);
            case "guardians": return sortedConversations.filter((c: any) => !c.isDirectMessage && !c.classroom);
            default: return sortedConversations;
          }
        })();

    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();

    return base.filter((conv: any) => {
      const isClassroomGroup = !!conv.classroom;
      const isDM = conv.isDirectMessage;
      const dmPartner = isDM ? conv.participants?.find((p: any) => p.id !== currentUserId) : null;
      const displayTitle = isClassroomGroup ? `${conv.classroom.name} Team` : isDM ? dmPartner?.name : `${conv.child?.firstName} ${conv.child?.lastName}`;
      return displayTitle?.toLowerCase().includes(q);
    });
  })();

  const filteredClassrooms = contactsData?.classrooms?.filter((room: any) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredContacts = contactsData?.contacts?.filter((contact: any) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const headerAvatar = (() => {
    if (showContacts || !activeConv) return null;
    if (activeConv.classroom) {
      return (
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="size-4" />
        </div>
      );
    }
    if (activeConv.isDirectMessage) {
      const partner = activeConv.participants?.find((p: any) => p.id !== currentUserId);
      return partner?.image ? (
        <Image src={partner.image} alt={partner.name} width={36} height={36} className="size-9 rounded-full border border-border object-cover" />
      ) : (
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="size-4" />
        </div>
      );
    }
    return activeConv.child?.photoUrl ? (
      <Image src={activeConv.child.photoUrl} alt="Child" width={36} height={36} className="size-9 rounded-full border border-border object-cover" />
    ) : (
      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="size-4" />
      </div>
    );
  })();

  // Guardians don't need to see the "Teams" tab in contacts
  const visibleContactTabs = isGuardian 
    ? CONTACT_TABS.filter(t => t.key === "direct") 
    : CONTACT_TABS;

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => openDrawer()}
        className="relative rounded-full p-2 transition-colors hover:bg-muted focus:outline-none"
      >
        <MessageSquare className="size-5 text-muted-foreground hover:text-foreground" />
        {totalUnread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-bold text-white shadow-sm">
            {totalUnread}
          </span>
        ) : isConnected && (
          <span className="absolute right-1 top-1 size-2.5 rounded-full border-2 border-background bg-emerald-500"></span>
        )}
      </motion.button>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  {(activeConv || showContacts) && !targetChildId && (
                    <button onClick={handleBackToConversations} className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-muted">
                      <ChevronLeft className="size-5" />
                    </button>
                  )}
                  {headerAvatar}
                  <h2 className="truncate font-display text-base font-semibold leading-tight text-foreground">
                    {showContacts ? "New Message" : activeConv ? (
                      activeConv.classroom ? `${activeConv.classroom.name} Team` : activeConv.isDirectMessage ? (
                        activeConv.participants?.find((p: any) => p.id !== currentUserId)?.name || "Direct Message"
                      ) : (
                        isGuardian ? activeConv.child?.firstName : `Regarding: ${activeConv.child?.firstName}`
                      )
                    ) : isGuardian ? "Messages about your children" : "Messages"}
                  </h2>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {/* Made the + button available to everyone */}
                  {!activeConv && !showContacts && (
                    <button
                      onClick={handleOpenContacts}
                      title="New Message"
                      className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                    >
                      <Plus className="size-4" />
                    </button>
                  )}
                  <button onClick={handleClose} className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden">
                {isInitializing ? (
                  <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
                ) : activeConv ? (
                  <ChatWindow conversationId={activeConv.id} currentUserId={currentUserId} />
                ) : showContacts ? (
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="relative flex gap-1 bg-card p-2">
                      {visibleContactTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setContactTab(tab.key)}
                          className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
                            contactTab === tab.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {contactTab === tab.key && (
                            <motion.span
                              layoutId="contactTabPill"
                              className="absolute inset-0 -z-10 rounded-full bg-primary"
                              transition={{ type: "spring", stiffness: 400, damping: 32 }}
                            />
                          )}
                          <tab.icon className="size-3.5" /> {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="px-3 pb-3">
                      <div className="relative flex items-center rounded-full bg-muted px-3.5 py-2">
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search contacts…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="ml-2.5 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-background">
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-2">
                      {isLoadingContacts ? (
                        <div className="space-y-1">
                          {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
                        </div>
                      ) : contactTab === "teams" ? (
                        filteredClassrooms.length > 0 ? (
                          filteredClassrooms.map((room: any) => (
                            <button
                              key={room.id}
                              disabled={isStartingDM}
                              onClick={() => { startClassroomMessage(room.id).then((res) => { setActiveConv(res.data); setShowContacts(false); setSearchQuery(""); }); }}
                              className="flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-colors hover:bg-muted disabled:opacity-60"
                            >
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="size-5" /></div>
                              <div className="flex-1">
                                <span className="block text-sm font-semibold text-foreground">{room.name} Team</span>
                                <span className="block text-xs text-muted-foreground">Group Chat</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-10 text-center">
                            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground"><Users className="size-5" /></div>
                            <p className="text-sm text-muted-foreground">No classroom teams found.</p>
                          </div>
                        )
                      ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((contact: any) => (
                          <button
                            key={contact.id}
                            disabled={isStartingDM}
                            onClick={() => startDM(contact.id)}
                            className="flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-colors hover:bg-muted disabled:opacity-60"
                          >
                            {contact.image ? (
                              <Image src={contact.image} alt={contact.name} width={40} height={40} className="size-10 shrink-0 rounded-full border border-border object-cover" />
                            ) : (
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><User className="size-5" /></div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-foreground">{contact.name}</span>
                                {contact.isOnline && <span className="size-1.5 rounded-full bg-emerald-500" />}
                              </div>
                              <span className="text-xs capitalize text-muted-foreground">{contact.role.replace("_", " ").toLowerCase()}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-10 text-center">
                          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground"><User className="size-5" /></div>
                          <p className="text-sm text-muted-foreground">No contacts found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col overflow-hidden">
                    {!isGuardian && (
                      <div className="custom-scrollbar overflow-x-auto bg-card px-2 pt-2">
                        <div className="relative flex min-w-max gap-1">
                          {MAIN_TABS.map((tab) => (
                            <button
                              key={tab.key}
                              onClick={() => setActiveTab(tab.key)}
                              className={`relative flex min-w-[84px] flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
                                activeTab === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {activeTab === tab.key && (
                                <motion.span
                                  layoutId="mainTabPill"
                                  className="absolute inset-0 -z-10 rounded-full bg-primary"
                                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                />
                              )}
                              <tab.icon className="size-3.5" /> {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-3 py-3">
                      <div className="relative flex items-center rounded-full bg-muted px-3.5 py-2">
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search conversations…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="ml-2.5 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-background">
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-2">
                      {isLoadingConvs ? (
                        <div className="space-y-1">
                          {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
                        </div>
                      ) : displayedConversations.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <MessageSquare className="size-5" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {searchQuery ? "No results found." : isGuardian ? "No messages yet." : `No ${activeTab} conversations.`}
                          </p>
                          {/* Allowed Guardians to use the empty state button as well */}
                          {!searchQuery && (
                            <button
                              onClick={handleOpenContacts}
                              className="mt-2 flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                            >
                              <Plus className="size-3.5" /> Start a new message
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {displayedConversations.map(renderConversationButton)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}