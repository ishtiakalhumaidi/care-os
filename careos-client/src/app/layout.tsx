import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Bricolage_Grotesque, Manrope, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProviders from "@/providers/QueryProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { ChatProvider } from "@/components/providers/ChatContext"; 
import GlobalBroadcastListener from "@/components/broadcast/GlobalBroadcastListener";
import GlobalChatListener from "@/components/chat/GlobalChatListener"; 
import "./globals.css";
import { Toaster } from "sonner";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CareOS - The Architecture of Modern Childcare",
  description: "A high-performance operating system for early childhood centers.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${manrope.variable} ${spaceMono.variable} antialiased`}>
        <QueryProviders>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SocketProvider token={token}>
              <ChatProvider>
                {children}
                <Toaster position="bottom-right" richColors closeButton />
                <GlobalBroadcastListener />
                <GlobalChatListener />
              </ChatProvider>
            </SocketProvider>
          </ThemeProvider>
        </QueryProviders>
      </body>
    </html>
  );
}