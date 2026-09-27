import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Lora } from "next/font/google";
import "@/app/globals.css";
import { FlashcardProvider } from "@/app/components/Flashcard/FlashcardContext";
import { SettingsProvider } from "@/app/components/settings/SettingsProvider";
import { I18nProvider } from "@/app/components/i18n/I18nProvider";
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
  // Runs before first paint to set the theme class on <html>, so the initial
  // (loading) background matches the saved dark/light setting instead of
  // flashing the default light background until React hydrates.
  const themeScript = `
(function () {
  try {
    var raw = localStorage.getItem("studytoolkit.settings.v1");
    var theme = "system";
    var lang = "en";
    if (raw) {
      var s = JSON.parse(raw);
      if (s && typeof s.theme === "string") theme = s.theme;
      if (s && typeof s.language === "string") lang = s.language;
    }
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = theme === "dark" || (theme === "system" && prefersDark);
    var root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.setAttribute("lang", lang);
  } catch (e) {}
})();
`;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lora.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SettingsProvider>
          <I18nProvider>
            <WorkspaceProvider>
              <FlashcardProvider>
                <AppShell>{children}</AppShell>
              </FlashcardProvider>
            </WorkspaceProvider>
          </I18nProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
