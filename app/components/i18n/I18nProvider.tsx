"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import { useSettings } from "@/app/components/settings/SettingsProvider";

export type Language = "en" | "ja";

export const LANGUAGES: Record<Language, { label: string; nativeLabel: string }> =
  {
    en: { label: "English", nativeLabel: "English" },
    ja: { label: "Japanese", nativeLabel: "日本語" },
  };

/**
 * Translation dictionaries. Keys are dot-namespaced by area. English is the
 * source of truth and the fallback used whenever a Japanese key is missing.
 */
const en = {
  // App chrome
  "app.name": "StudyToolkit",
  "app.localWorkspace": "Local workspace",
  "app.notifications": "Notifications",
  "app.search": "Search",
  "app.searchAria": "Search your study space",
  "app.help": "Help",
  "app.soon": "Soon",
  "app.openSidebar": "Open sidebar",
  "app.settings": "Settings",

  // Navigation / titles
  "nav.dashboard": "Dashboard",
  "nav.tasks": "Tasks",
  "nav.flashcards": "Flashcards",
  "nav.cards": "Cards",
  "nav.notes": "Notes",
  "nav.timer": "Timer",
  "nav.resources": "Resources",
  "nav.calculator": "Calculator",
  "title.defaultSpace": "My Study Space",

  // Workspace empty state
  "workspace.buildTitle": "Build your study space",
  "workspace.buildSubtitle":
    "Add the tools you use most and arrange them however you like.",
  "workspace.buildSubtitleMobile":
    "Add the tools you use most and arrange them your way.",
  "workspace.addFirst": "Add your first module",
  "workspace.addModule": "Add module",

  // Zoom controls
  "zoom.in": "Zoom in",
  "zoom.out": "Zoom out",
  "zoom.reset": "Reset zoom",
  "zoom.fit": "Fit",

  // Add-module modal
  "add.title": "Add a module",
  "add.subtitle": "Pick a tool to add to your study space.",
  "add.close": "Close",
  "add.category.study": "Study",
  "add.category.utilities": "Utilities",

  // Settings modal
  "settings.title": "Settings",
  "settings.close": "Close",
  "settings.done": "Done",
  "settings.resetAll": "Reset all settings",
  "settings.section.appearance": "Appearance",
  "settings.section.workspace": "Workspace",
  "settings.section.data": "Data",
  "settings.section.timerNotes": "Timer & Notes",
  "settings.section.profile": "Profile",
  "settings.theme": "Theme",
  "settings.theme.system": "System",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.accent": "Accent color",
  "settings.font": "Font",
  "settings.fontSize": "Base font size",
  "settings.deskTexture": "Desk texture",
  "settings.language": "Language",
  "settings.dashboardSize": "Dashboard size",
  "settings.dashboardSize.fit": "Fit to window",
  "settings.dashboardSize.custom": "Custom",
  "settings.defaultZoom": "Default zoom",
  "settings.snapping": "Snapping guides",
  "settings.resetWorkspace": "Reset workspace",
  "settings.confirm": "Confirm",
  "settings.cancel": "Cancel",
  "settings.reset": "Reset",
  "settings.exportLayout": "Export layout",
  "settings.importLayout": "Import layout",
  "settings.importError": "That file couldn't be imported.",
  "settings.focusMin": "Focus (min)",
  "settings.breakMin": "Break (min)",
  "settings.longBreakMin": "Long break (min)",
  "settings.rounds": "Rounds before long break",
  "settings.notesCount": "Quick Notes count",
  "settings.notes.words": "Words",
  "settings.notes.chars": "Chars",
  "settings.spaceTitle": "Space title",
  "settings.displayName": "Display name",

  // Common
  "common.student": "Student",
  "common.comingSoon": "Coming soon",
  "module.options": "Module options",
  "module.remove": "Remove",
} as const;

export type TranslationKey = keyof typeof en;

const ja: Partial<Record<TranslationKey, string>> = {
  // App chrome
  "app.name": "StudyToolkit",
  "app.localWorkspace": "ローカルワークスペース",
  "app.notifications": "通知",
  "app.search": "検索",
  "app.searchAria": "スタディスペースを検索",
  "app.help": "ヘルプ",
  "app.soon": "近日公開",
  "app.openSidebar": "サイドバーを開く",
  "app.settings": "設定",

  // Navigation / titles
  "nav.dashboard": "ダッシュボード",
  "nav.tasks": "タスク",
  "nav.flashcards": "フラッシュカード",
  "nav.cards": "カード",
  "nav.notes": "ノート",
  "nav.timer": "タイマー",
  "nav.resources": "リソース",
  "nav.calculator": "電卓",
  "title.defaultSpace": "マイスタディスペース",

  // Workspace empty state
  "workspace.buildTitle": "スタディスペースを作成",
  "workspace.buildSubtitle":
    "よく使うツールを追加して、好きなように配置しましょう。",
  "workspace.buildSubtitleMobile":
    "よく使うツールを追加して、自由に配置しましょう。",
  "workspace.addFirst": "最初のモジュールを追加",
  "workspace.addModule": "モジュールを追加",

  // Zoom controls
  "zoom.in": "拡大",
  "zoom.out": "縮小",
  "zoom.reset": "ズームをリセット",
  "zoom.fit": "全体表示",

  // Add-module modal
  "add.title": "モジュールを追加",
  "add.subtitle": "スタディスペースに追加するツールを選択してください。",
  "add.close": "閉じる",
  "add.category.study": "学習",
  "add.category.utilities": "ユーティリティ",

  // Settings modal
  "settings.title": "設定",
  "settings.close": "閉じる",
  "settings.done": "完了",
  "settings.resetAll": "すべての設定をリセット",
  "settings.section.appearance": "外観",
  "settings.section.workspace": "ワークスペース",
  "settings.section.data": "データ",
  "settings.section.timerNotes": "タイマーとノート",
  "settings.section.profile": "プロフィール",
  "settings.theme": "テーマ",
  "settings.theme.system": "システム",
  "settings.theme.light": "ライト",
  "settings.theme.dark": "ダーク",
  "settings.accent": "アクセントカラー",
  "settings.font": "フォント",
  "settings.fontSize": "基本フォントサイズ",
  "settings.deskTexture": "デスクの質感",
  "settings.language": "言語",
  "settings.dashboardSize": "ダッシュボードのサイズ",
  "settings.dashboardSize.fit": "ウィンドウに合わせる",
  "settings.dashboardSize.custom": "カスタム",
  "settings.defaultZoom": "デフォルトのズーム",
  "settings.snapping": "スナップガイド",
  "settings.resetWorkspace": "ワークスペースをリセット",
  "settings.confirm": "確認",
  "settings.cancel": "キャンセル",
  "settings.reset": "リセット",
  "settings.exportLayout": "レイアウトを書き出す",
  "settings.importLayout": "レイアウトを読み込む",
  "settings.importError": "このファイルは読み込めませんでした。",
  "settings.focusMin": "集中（分）",
  "settings.breakMin": "休憩（分）",
  "settings.longBreakMin": "長い休憩（分）",
  "settings.rounds": "長い休憩までのラウンド数",
  "settings.notesCount": "クイックノートのカウント",
  "settings.notes.words": "単語",
  "settings.notes.chars": "文字",
  "settings.spaceTitle": "スペース名",
  "settings.displayName": "表示名",

  // Common
  "common.student": "学生",
  "common.comingSoon": "近日公開",
  "module.options": "モジュールオプション",
  "module.remove": "削除",
};

const DICTIONARIES: Record<Language, Partial<Record<TranslationKey, string>>> = {
  en,
  ja,
};

export type TranslateFn = (key: TranslationKey) => string;

interface I18nContextValue {
  language: Language;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const language = settings.language;

  const t = useCallback<TranslateFn>(
    (key) => DICTIONARIES[language][key] ?? en[key] ?? key,
    [language],
  );

  const value = useMemo(() => ({ language, t }), [language, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

/** Convenience hook returning just the translate function. */
export function useT(): TranslateFn {
  return useI18n().t;
}
