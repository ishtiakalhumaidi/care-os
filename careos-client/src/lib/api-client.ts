import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const serverApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

serverApi.interceptors.request.use(
  async (config) => {
    let token: string | undefined;

    if (typeof window === "undefined") {
      // 1. Server-Side Execution (e.g., page.tsx prefetching)
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    } else {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
      };
      token = getCookie("accessToken");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);