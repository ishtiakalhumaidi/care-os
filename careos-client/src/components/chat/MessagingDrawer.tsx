/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  MessageSquare, X, ChevronLeft, Loader2, User, Plus,
  Users, ShieldAlert, MessageCircle, Inbox, Search
} from "lucide-react";
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

  // FIX: Properly handle URL cleanup to prevent Next.js 404 errors
  useEffect(() => {
    if (searchParams.get("action") === "open-chat") {
      openDrawer(); 
      
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      
      // If params are empty, route cleanly to the pathname, otherwise append params
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, openDrawer, pathname, router]);

  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [contactTab, setContactTab] = useState<ContactTabType>("direct");
  const [searchQuery, setSearchQuery] = useState(""); // <-- Search State added

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

  const { data: contactsData, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["message-contacts"],
    queryFn: () => getContacts().then((res) => res.data),
    enabled: showContacts && !isGuardian,
  });

  const { mutate: startDM, isPending: isStartingDM } = useMutation({
    mutationFn: startDirectMessage,
    onSuccess: (res) => {
      setActiveConv(res.data);
      setShowContacts(false);
      setSearchQuery(""); // Reset search on start
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
    setSearchQuery(""); // Reset search on close
    closeDrawer();
  };

  const handleOpenContacts = () => {
    setShowContacts(true);
    setSearchQuery(""); // Reset search when toggling view
  };

  const handleBackToConversations = () => {
    setActiveConv(null);
    setShowContacts(false);
    setSearchQuery(""); // Reset search when going back
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
        className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors text-left"
      >
        {displayPhoto ? (
          <Image src={displayPhoto} alt="Profile" width={44} height={44} className="size-11 rounded-full object-cover shrink-0 border border-border" />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            {isClassroomGroup ? <Users className="size-5" /> : <User className="size-5" />}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-0.5">
            <span className={`text-sm truncate ${hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
              {!isDM && !isClassroomGroup && !isGuardian && <span className="font-normal text-muted-foreground">Regarding: </span>}
              {displayTitle}
            </span>
            {lastMsg && (
              <span 
                suppressHydrationWarning
                className={`text-[10px] whitespace-nowrap ml-2 ${hasUnread ? "font-bold text-primary" : "text-muted-foreground"}`}
              >
                {new Date(lastMsg.createdAt).toLocaleTimeString("en-US", { 
                  hour: "2-digit", minute: "2-digit" 
                })}
              </span>
            )}
          </div>
          <p className={`text-xs truncate ${hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
            {lastMsg ? (
              lastMsg.isDeleted ? <span className="italic">Message removed</span> : <><span className="opacity-75">{senderName}: </span>{lastMsg.content}</>
            ) : "Start a conversation"}
          </p>
        </div>
        {hasUnread && (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {conv._count.messages}
          </span>
        )}
      </button>
    );
  };

  // Filter Conversations based on search
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

  // Filter Contacts based on search
  const filteredClassrooms = contactsData?.classrooms?.filter((room: any) => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredContacts = contactsData?.contacts?.filter((contact: any) => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <button onClick={() => openDrawer()} className="relative p-2 rounded-full hover:bg-muted transition-colors focus:outline-none">
        <MessageSquare className="size-5 text-muted-foreground hover:text-foreground" />
        {totalUnread > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white border-2 border-background shadow-sm">
            {totalUnread}
          </span>
        ) : isConnected && (
          <span className="absolute top-1 right-1 size-2.5 rounded-full bg-emerald-500 border-2 border-background"></span>
        )}
      </button>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
              <div className="flex items-center gap-2">
                {(activeConv || showContacts) && !targetChildId && (
                  <button onClick={handleBackToConversations} className="p-1 hover:bg-muted rounded-md transition-colors">
                    <ChevronLeft className="size-5" />
                  </button>
                )}
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  {showContacts ? "New Message" : activeConv ? (
                    activeConv.classroom ? `${activeConv.classroom.name} Team` : activeConv.isDirectMessage ? (
                      activeConv.participants?.find((p: any) => p.id !== currentUserId)?.name || "Direct Message"
                    ) : (
                      <>
                        {activeConv.child?.photoUrl ? (
                          <Image src={activeConv.child.photoUrl} alt="Child" width={24} height={24} className="size-6 rounded-full object-cover" />
                        ) : (
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0"><User className="size-3" /></div>
                        )}
                        {isGuardian ? activeConv.child?.firstName : `Regarding: ${activeConv.child?.firstName}`}
                      </>
                    )
                  ) : isGuardian ? "Messages about your children" : "Messages"}
                </h2>
              </div>

              <div className="flex items-center gap-1">
                {!activeConv && !showContacts && !isGuardian && (
                  <button onClick={handleOpenContacts} className="p-2 rounded-md hover:bg-muted transition-colors text-primary" title="New Message">
                    <Plus className="size-5" />
                  </button>
                )}
                <button onClick={handleClose} className="p-2 rounded-md hover:bg-muted transition-colors">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {isInitializing ? (
                <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
              ) : activeConv ? (
                <ChatWindow conversationId={activeConv.id} currentUserId={currentUserId} />
              ) : showContacts && !isGuardian ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex border-b border-border">
                    <button onClick={() => setContactTab("direct")} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold tracking-wide transition-colors ${contactTab === "direct" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <User className="size-3.5" /> Direct
                    </button>
                    <button onClick={() => setContactTab("teams")} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold tracking-wide transition-colors ${contactTab === "teams" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <Users className="size-3.5" /> Teams
                    </button>
                  </div>
                  
                  {/* Search Bar for Contacts */}
                  <div className="p-2 border-b border-border bg-card/50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {isLoadingContacts ? (
                      <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
                    ) : contactTab === "teams" ? (
                      filteredClassrooms.length > 0 ? (
                        filteredClassrooms.map((room: any) => (
                          <button key={room.id} disabled={isStartingDM} onClick={() => { startClassroomMessage(room.id).then((res) => { setActiveConv(res.data); setShowContacts(false); setSearchQuery(""); }); }} className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors text-left">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0"><Users className="size-5" /></div>
                            <div className="flex-1">
                              <span className="font-semibold text-sm">{room.name} Team</span>
                              <span className="block text-xs text-muted-foreground">Group Chat</span>
                            </div>
                          </button>
                        ))
                      ) : <div className="text-center p-8 text-sm text-muted-foreground">No classroom teams found.</div>
                    ) : filteredContacts.length > 0 ? (
                      filteredContacts.map((contact: any) => (
                        <button key={contact.id} disabled={isStartingDM} onClick={() => startDM(contact.id)} className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors text-left">
                          {contact.image ? <Image src={contact.image} alt={contact.name} width={40} height={40} className="size-10 rounded-full object-cover shrink-0" /> : <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0"><User className="size-5" /></div>}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{contact.name}</span>
                              {contact.isOnline && <span className="size-1.5 rounded-full bg-emerald-500"></span>}
                            </div>
                            <span className="text-xs text-muted-foreground">{contact.role.replace("_", " ")}</span>
                          </div>
                        </button>
                      ))
                    ) : <div className="text-center p-8 text-sm text-muted-foreground">No contacts found.</div>}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {!isGuardian && (
                    <div className="flex overflow-x-auto border-b border-border bg-card z-10 sticky top-0 custom-scrollbar">
                      <button onClick={() => setActiveTab("all")} className={`min-w-[75px] flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold tracking-wide transition-colors ${activeTab === "all" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        <Inbox className="size-3.5" /> All
                      </button>
                      <button onClick={() => setActiveTab("direct")} className={`min-w-[75px] flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold tracking-wide transition-colors ${activeTab === "direct" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        <MessageCircle className="size-3.5" /> Direct
                      </button>
                      <button onClick={() => setActiveTab("teams")} className={`min-w-[75px] flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold tracking-wide transition-colors ${activeTab === "teams" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        <Users className="size-3.5" /> Teams
                      </button>
                      <button onClick={() => setActiveTab("guardians")} className={`min-w-[90px] flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold tracking-wide transition-colors ${activeTab === "guardians" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        <ShieldAlert className="size-3.5" /> Guardians
                      </button>
                    </div>
                  )}

                  {/* Search Bar for Conversations */}
                  <div className="p-2 border-b border-border bg-card/50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {isLoadingConvs ? (
                      <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
                    ) : displayedConversations.length === 0 ? (
                      <div className="flex flex-col h-full items-center justify-center text-center p-8">
                        <MessageSquare className="size-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-foreground">
                          {searchQuery ? "No results found." : isGuardian ? "No messages yet." : `No ${activeTab} conversations.`}
                        </p>
                        {(!searchQuery && !isGuardian) && (
                          <button onClick={handleOpenContacts} className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline">
                            <Plus className="size-4" /> Start a new message
                          </button>
                        )}
                      </div>
                    ) : displayedConversations.map(renderConversationButton)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}