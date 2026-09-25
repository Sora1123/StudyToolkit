import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Lora } from "next/font/google";
import "@/app/globals.css";
import { FlashcardProvider } from "@/context/FlashcardContext";
import { SettingsProvider } from "@/app/components/settings/SettingsProvider";
import { WorkspaceProvider } from "@/app/components/workspace/WorkspaceProvider";
import AppShell from "@/app/components/layout/AppShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyToolkit — My Study Space",
  description: "A customizable all-in-one study workspace for students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lora.variable}`}
    >
      <body>
        <SettingsProvider>
          <WorkspaceProvider>
            <FlashcardProvider>
              <AppShell>{children}</AppShell>
            </FlashcardProvider>
          </WorkspaceProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
