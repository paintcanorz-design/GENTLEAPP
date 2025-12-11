export interface Phrase {
  jp: string;
  cn: string;
}

export interface SubCategory {
  label: string;
  phrases: Phrase[];
}

export interface MainCategory {
  label: string;
  subs: Record<string, SubCategory>;
}

export interface Database {
  [key: string]: MainCategory;
}

export interface GeneratedResult {
  base: Phrase;
  emoji: string;
  id: string; // Unique ID for key
}

export enum AppStatusType {
  IDLE = 'IDLE',
  SELECTED = 'SELECTED',
  GEN_REPLY = 'GEN_REPLY',
  GEN_KEYWORD = 'GEN_KEYWORD',
  AI_REWRITING = 'AI_REWRITING',
}

export interface AppStatus {
  type: AppStatusType;
  text: string;
}

export enum EmojiStyle {
  EXCLAMATION = 0,
  KAOMOJI = 1,
  CUSTOM = 2,
  FACES = 3,
}

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface UserAchievement {
  unlocked: boolean;
  date: number;
}

export interface SavedCategory {
  main: string;
  sub: string;
  label: string;
}

export interface AppSettings {
  fontSize: number;
  resultCount: number;
  showCN: boolean;
  showSpeak: boolean;
  customMin: number;
  customMax: number;
  voiceRate: number;
  voicePitch: number;
  userXP: number;
  userLevel: number;
  userTheme: string;
  darkMode: boolean;
  hideFun: boolean;
  totalCopies: number;
  
  // Custom Emoji Arrays
  activeFaces: string[];
  activeDecor: string[];
  disabledFaces: string[];
  disabledDecor: string[];
}

export type ModalType = 'settings' | 'history' | 'achievements' | 'tutorial' | 'welcome' | 'xp' | null;
