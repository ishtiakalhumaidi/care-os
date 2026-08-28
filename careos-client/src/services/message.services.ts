/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export interface IMessageSender {
  id: string;
  name: string;
  role: string;
  image?: string | null;
}

export interface IMessage {
  id: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  isEdited: boolean;
  senderId: string;
  sender: IMessageSender;
}

export interface IConversation {
  id: string;
  isDirectMessage: boolean;
  createdAt: string;
  updatedAt: string;
  childId?: string | null;
  child?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  participants?: IMessageSender[];
}

export interface IConversationPreview {
  id: string;
  isDirectMessage: boolean;
  participants?: IMessageSender[];
  child?: { id: string; firstName: string; lastName: string; photoUrl?: string };
  classroom?: { id: string; name: string }; 
  messages: IMessage[]; 
  _count: { messages: number }; 
}

export const getMyConversations = async () => {
  try {
    const response = await serverApi.get("/messages/conversations/me");
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch conversations");
  }
};

export const getConversationByChild = async (childId: string) => {
  try {
    const response = await serverApi.get(`/messages/conversation/child/${childId}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation",
    );
  }
};

export const getConversationMessages = async (conversationId: string) => {
  try {
    const response = await serverApi.get(`/messages/conversation/${conversationId}/messages`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch messages",
    );
  }
};



export const getContacts = async () => {
  try {
    const response = await serverApi.get("/messages/contacts");
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch contacts");
  }
};

export const startDirectMessage = async (targetId: string) => {
  try {
    const response = await serverApi.post("/messages/conversations/dm", { targetId });
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to start direct message");
  }
};

export const startClassroomMessage = async (classroomId: string) => {
  try {
    const response = await serverApi.post("/messages/conversations/classroom", { classroomId });
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to start classroom message");
  }
};