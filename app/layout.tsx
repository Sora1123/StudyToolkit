import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { FlashcardProvider } from "@/context/FlashcardContext";
import AppShell from "@/app/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyToolkit — My Study Space",
  description: "A customizable all-in-one study workspace for students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <FlashcardProvider>
          <AppShell>{children}</AppShell>
        </FlashcardProvider>
      </body>
    </html>
  );
}
