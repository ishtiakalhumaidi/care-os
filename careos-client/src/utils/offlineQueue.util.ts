/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export interface IOfflineAction {
  id: string;
  type: "CONFIRM_CHECKIN" | "CONFIRM_CHECKOUT";
  attendanceId: string;
  timestamp: string;
  payload?: any;
}

const QUEUE_KEY = "careos_offline_queue";

export const getOfflineQueue = (): IOfflineAction[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(QUEUE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addOfflineAction = (action: Omit<IOfflineAction, "id">) => {
  if (typeof window === "undefined") return;
  const queue = getOfflineQueue();
  const newAction: IOfflineAction = { ...action, id: crypto.randomUUID() };
  queue.push(newAction);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const removeOfflineAction = (actionId: string) => {
  if (typeof window === "undefined") return;
  const queue = getOfflineQueue();
  const filtered = queue.filter(a => a.id !== actionId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
};

export const clearOfflineQueue = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
};