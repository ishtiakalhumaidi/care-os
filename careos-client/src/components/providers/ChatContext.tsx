"use client";

import React, { createContext, useContext, useState } from "react";

interface ChatContextType {
  isDrawerOpen: boolean;
  targetChildId: string | null;
  openDrawer: (childId?: string) => void;
  closeDrawer: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [targetChildId, setTargetChildId] = useState<string | null>(null);

  const openDrawer = (childId?: string) => {
    if (childId) setTargetChildId(childId);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTargetChildId(null);
  };

  return (
    <ChatContext.Provider value={{ isDrawerOpen, targetChildId, openDrawer, closeDrawer }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};