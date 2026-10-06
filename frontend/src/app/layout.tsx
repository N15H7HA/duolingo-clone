import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duolingo - The world's best way to learn a language",
  description: "Learn Spanish in just 5 minutes a day with game-like lessons.",
};

import DevDrawer from "@/components/dev/DevDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-nunito bg-snow text-eel min-h-screen antialiased selection:bg-selectedCardBg">
        <QueryProvider>
          {children}
          <DevDrawer />
        </QueryProvider>
      </body>
    </html>
  );
}
