import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Database, 
  Phrase, 
  GeneratedResult, 
  AppStatus, 
  AppStatusType, 
  EmojiStyle,
  AchievementDef,
  UserAchievement,
  AppSettings,
  ModalType,
  SavedCategory
} from './types';
import { fetchData } from './services/dataService';
import { generateKeywords, generateReply, rewritePhrases } from './services/geminiService';
import { SettingsModal, HistoryModal, AchievementsModal, WelcomeModal, TutorialModal, LevelModal } from './Modals';
import { 
  RefreshCw, Dices, Copy, Volume2, Star, Search, History, Trophy, Settings, Wand2, MessageCircle, ChevronDown, ChevronUp, Plus, Heart
} from 'lucide-react';

// --- Constants & Data ---
const LEVEL_TITLES: Record<number, string> = { 
  1: "見習紳士", 10: "變態預備軍", 20: "賢者模式", 30: "資深老司機", 40: "紳士鑑賞家", 50: "碩果僅存的紳士", 
  60: "變態的極致", 70: "紳士大師", 80: "變態宗師", 90: "紳士之神", 100: "傳說中的變態", 
  110: "薄本獵人", 120: "聖光破壞者", 130: "絕對領域觀測員", 140: "惡墮鑑賞家", 150: "觸手操控師", 
  160: "異種姦審查官", 170: "時間停止使用者", 180: "催眠洗腦大師", 190: "步兵團總司令", 200: "變態紳士王" 
};

const UNLOCKS: Record<number, string> = { 
    10: "🌸 戀愛粉主題", 20: "🧘 賢者黑白主題", 30: "🌿 清新綠主題", 40: "🍷 酒紅色主題", 
    50: "🥈 冷冽銀主題", 60: "🔮 夢幻紫主題", 70: "👑 帝王金主題", 80: "🌈 色彩繽紛主題", 
    90: "✖️ X 配色主題", 100: "🍊 愛馬仕橘主題", 110: "📦 Fanbox 主題", 120: "▶️ Youtube 主題", 
    130: "🤖 科技藍主題", 140: "🦴 噗浪主題", 150: "🍈 Melon 主題" 
};

const ACHIEVEMENTS_DATA: Record<string, AchievementDef> = {
    "first_copy": { id: "first_copy", icon: "🌱", title: "初出茅廬", desc: "第一次複製任何句子" },
    "first_fav": { id: "first_fav", icon: "⭐", title: "心動時刻", desc: "第一次將句子加入「我的最愛」" },
    "first_search": { id: "first_search", icon: "🔍", title: "尋寶獵人", desc: "使用過 1 次「搜尋」功能" },
    "read_tutorial": { id: "read_tutorial", icon: "📖", title: "好學生", desc: "完整打開並閱讀過「使用教學」" },
    "download_card": { id: "download_card", icon: "📸", title: "永恆的瞬間", desc: "成功下載一次「今日運勢」圖片" },
    "n1_japanese": { id: "n1_japanese", icon: "🇯🇵", title: "日文N1", desc: "在設定中關閉「顯示中文翻譯」" },
    "copy_50": { id: "copy_50", icon: "🗣️", title: "口若懸河", desc: "累計複製次數達到 50 次" },
    "copy_500": { id: "copy_500", icon: "💘", title: "千言萬語", desc: "累計複製次數達到 500 次" },
    "combo_master": { id: "combo_master", icon: "⚡", title: "連擊大師", desc: "在 10 秒內連續複製 5 次" },
    "fav_full": { id: "fav_full", icon: "💗", title: "博愛主義者", desc: "我的最愛存滿 24 個句子" },
    "fav_del": { id: "fav_del", icon: "💔", title: "斷捨離", desc: "從我的最愛中刪除一個句子" },
    "regen_20": { id: "regen_20", icon: "🔄", title: "換帖兄弟", desc: "連續點擊「換一批」按鈕 20 次" },
    "five_star_general": { id: "five_star_general", icon: "🎖️", title: "五星上將", desc: "在今日運勢中抽到五星金框" },
    "voice_lover": { id: "voice_lover", icon: "🔊", title: "聲之形", desc: "點擊 10 次語音播放按鈕" },
    "rap_god": { id: "rap_god", icon: "🎤", title: "快嘴饒舌", desc: "將語音語速調到最快 (1.5) 並按下試聽" },
    "custom_emoji": { id: "custom_emoji", icon: "🙂", title: "表情鍊金術師", desc: "在設定中新增一個「自訂表情符號」" },
    "erotic_fan": { id: "erotic_fan", icon: "🔞", title: "誠實的紳士", desc: "連續生成「🔞 紳士讚美」分類 10 次" },
    "pure_love": { id: "pure_love", icon: "🥰", title: "純愛戰士", desc: "連續生成「🥰 單純可愛」分類 10 次" },
    "kaomoji_fan": { id: "kaomoji_fan", icon: "(=^・^=)", title: "顏文字控", desc: "將表情設定切換為「顏文字」並生成" },
    "color_master": { id: "color_master", icon: "🌈", title: "色彩大師", desc: "更換過 3 種不同的介面主題" },
    "ai_awakening": { id: "ai_awakening", icon: "🤖", title: "機械飛昇", desc: "成功使用 AI 功能進行擴寫" },
    "level_50": { id: "level_50", icon: "🥈", title: "半百紳士", desc: "等級達到 LV.50" },
    "level_100": { id: "level_100", icon: "👑", title: "百級成神", desc: "等級達到 LV.100" },
    "all_complete": { id: "all_complete", icon: "🏆", title: "大滿貫", desc: "解鎖所有其他成就" }
};

const DEFAULT_FACES = ["😍", "🥰", "😘", "😚", "😋", "🥵", "😳", "🥺", "😭", "😤", "🙏", "🤤", "😵‍💫", "🫠"];
const DEFAULT_DECOR = ["❤️", "🧡", "💛", "💙", "💜", "✨", "🌟", "💫", "💥", "🔥", "💦", "💖", "💘", "💝"];
const PUNCTUATIONS = ["…", "…！", "…！！", "！", "！！", "！！！"];
const KAOMOJI = ["(≧∇≦)", "(*°∀°)=3", "(´;;ω;;`)", "🙏✨", "(//∇//)"];

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 1, resultCount: 6, showCN: true, showSpeak: true, customMin: 3, customMax: 5,
  voiceRate: 1.1, voicePitch: 1.0, userXP: 0, userLevel: 1, userTheme: 'default',
  darkMode: false, hideFun: false, totalCopies: 0,
  activeFaces: [...DEFAULT_FACES], activeDecor: [...DEFAULT_DECOR], disabledFaces: [], disabledDecor: []
};

const App: React.FC = () => {
  // --- State ---
  const [db, setDb] = useState<Database>({});
  const [loading, setLoading] = useState(true);
  const [isDictExpanded, setIsDictExpanded] = useState(false);
  
  const [currentMain, setCurrentMain] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [status, setStatus] = useState<AppStatus>({ type: AppStatusType.IDLE, text: '請選擇預設辭庫或AI生成' });
  
  const [emojiStyle, setEmojiStyle] = useState<EmojiStyle>(EmojiStyle.FACES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedCategories, setSavedCategories] = useState<SavedCategory[]>([]);
  const [historyLog, setHistoryLog] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [userAchieve, setUserAchieve] = useState<Record<string, UserAchievement>>({});
  
  const [activeModal, setActiveModal] = useState<ModalType>('welcome');
  const [welcomeData, setWelcomeData] = useState({ jp: "載入中...", icon: "🎁", stars: 3 });

  // Session counters for achievements
  const regenCountRef = useRef(0);
  const voiceCountRef = useRef(0);
  const copyTimeRef = useRef(0);
  const copyComboRef = useRef(0);
  const eroticStreakRef = useRef(0);
  const cuteStreakRef = useRef(0);
  const themeSetRef = useRef<Set<string>>(new Set());

  // --- Effects ---

  // 1. Init Data & Wix Sync
  useEffect(() => {
    const init = async () => {
      const data = await fetchData();
      setDb(data);
      setLoading(false);
      
      // Init Welcome Data
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const m = data[keys[Math.floor(Math.random() * keys.length)]];
        const sKeys = Object.keys(m.subs);
        const s = m.subs[sKeys[Math.floor(Math.random() * sKeys.length)]];
        const p = s.phrases[Math.floor(Math.random() * s.phrases.length)];
        
        const stars = Math.random() < 0.2 ? 5 : (Math.floor(Math.random() * 3) + 3);
        const faces = (settings.activeFaces && settings.activeFaces.length > 0) ? settings.activeFaces : DEFAULT_FACES;
        setWelcomeData({ 
            jp: p.jp, 
            icon: faces[Math.floor(Math.random() * faces.length)] || "🎁", 
            stars: stars 
        });
        
        if (stars === 5) setTimeout(() => unlockAchievement('five_star_general'), 1000);
      }
    };
    init();

    // LocalStorage Load
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ 
              ...DEFAULT_SETTINGS, 
              ...parsed,
              // Ensure arrays are not undefined if legacy data is loaded
              activeFaces: parsed.activeFaces || DEFAULT_FACES,
              activeDecor: parsed.activeDecor || DEFAULT_DECOR,
              disabledFaces: parsed.disabledFaces || [],
              disabledDecor: parsed.disabledDecor || []
          });
      }
      const savedFavs = localStorage.getItem('favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedCats = localStorage.getItem('savedCategories');
      if (savedCats) setSavedCategories(JSON.parse(savedCats));
      const savedHist = localStorage.getItem('historyLog');
      if (savedHist) setHistoryLog(JSON.parse(savedHist));
      const savedAchieve = localStorage.getItem('userAchieve');
      if (savedAchieve) setUserAchieve(JSON.parse(savedAchieve));
    } catch(e) {}

    // Wix Message Listener - Critical for restoration
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'LOAD_DATA' && data.payload) {
         try {
             const payload = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
             if(payload.appSettings) {
                 setSettings(prev => ({ 
                     ...prev, 
                     ...payload.appSettings,
                     // Safeguard against missing arrays in payload
                     activeFaces: payload.appSettings.activeFaces || prev.activeFaces || DEFAULT_FACES,
                     activeDecor: payload.appSettings.activeDecor || prev.activeDecor || DEFAULT_DECOR
                 }));
             }
             if(payload.favorites) setFavorites(payload.favorites);
             if(payload.savedSubCategories) setSavedCategories(payload.savedSubCategories);
             if(payload.historyLog) setHistoryLog(payload.historyLog);
             if(payload.userAchieve) setUserAchieve(payload.userAchieve);
         } catch(e) { console.error("Parse error", e); }
      }
    };
    window.addEventListener('message', handleMessage);
    // Request load from parent
    window.parent.postMessage({ type: 'REQUEST_LOAD' }, "*");

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 2. Persist & Sync to Wix
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('savedCategories', JSON.stringify(savedCategories));
    localStorage.setItem('historyLog', JSON.stringify(historyLog));
    localStorage.setItem('userAchieve', JSON.stringify(userAchieve));
    
    // Wix Sync
    const backupData = { 
        appSettings: settings, 
        favorites, 
        savedSubCategories: savedCategories, 
        historyLog, 
        userAchieve 
    };
    window.parent.postMessage({ type: 'SAVE_DATA', payload: JSON.stringify(backupData) }, "*");
  }, [settings, favorites, savedCategories, historyLog, userAchieve]);

  // 3. Theme Application & Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.forEach(c => {
      if (c.startsWith('theme-')) root.classList.remove(c);
    });
    if (settings.userTheme !== 'default') {
      root.classList.add(`theme-${settings.userTheme}`);
    }

    // Dark Mode Logic
    if (settings.darkMode) {
        root.classList.add('dark');
        root.classList.add('dark-mode');
    } else {
        root.classList.remove('dark');
        root.classList.remove('dark-mode');
    }

    const computedStyle = getComputedStyle(root);
    const bg = computedStyle.getPropertyValue('--bg').trim();
    window.parent.postMessage({ type: 'CHANGE_BG', color: bg || '#F2F2F7' }, "*");

    // Track Theme Usage
    themeSetRef.current.add(settings.userTheme);
    if(themeSetRef.current.size >= 3) unlockAchievement('color_master');
  }, [settings.userTheme, settings.darkMode]);

  // 4. Other Checks
  useEffect(() => {
      if (!settings.showCN) unlockAchievement('n1_japanese');
      if (settings.activeFaces?.length > DEFAULT_FACES.length) unlockAchievement('custom_emoji');
  }, [settings.showCN, settings.activeFaces]);

  // Check all complete
  useEffect(() => {
     if(userAchieve['all_complete']) return;
     const total = Object.keys(ACHIEVEMENTS_DATA).length - 1; // exclude all_complete itself
     // Fix for potentially undefined values during filtering
     const unlocked = Object.values(userAchieve).filter(u => {
         const key = Object.keys(userAchieve).find(k => userAchieve[k] === u);
         return u.unlocked && key && ACHIEVEMENTS_DATA[key]?.id !== 'all_complete';
     }).length;
     
     if(unlocked >= total && total > 0) unlockAchievement('all_complete');
  }, [userAchieve]);


  // --- Logic Helpers ---

  const unlockAchievement = (id: string) => {
    if (settings.hideFun || userAchieve[id]?.unlocked || !ACHIEVEMENTS_DATA[id]) return;
    setUserAchieve(prev => ({ ...prev, [id]: { unlocked: true, date: Date.now() } }));
    addXP(10); 
  };

  const addXP = (amount: number) => {
    if (settings.hideFun) return;
    setSettings(prev => {
      const newXP = prev.userXP + amount;
      // Requirement: 5 XP per level
      let newLevel = Math.floor(newXP / 5) + 1;
      
      if (newLevel > prev.userLevel) {
          if(newLevel >= 50) unlockAchievement('level_50');
          if(newLevel >= 100) unlockAchievement('level_100');
      }
      return { ...prev, userXP: newXP, userLevel: newLevel };
    });
  };

  const generateEmoji = (style: EmojiStyle): string => {
    if (style === EmojiStyle.EXCLAMATION) return PUNCTUATIONS[Math.floor(Math.random() * PUNCTUATIONS.length)];
    if (style === EmojiStyle.KAOMOJI) return " " + KAOMOJI[Math.floor(Math.random() * KAOMOJI.length)];
    
    // SAFEGUARD: Check for undefined/null arrays before accessing .length
    const faces = (settings.activeFaces && settings.activeFaces.length > 0) ? settings.activeFaces : DEFAULT_FACES;
    const decorList = (settings.activeDecor && settings.activeDecor.length > 0) ? settings.activeDecor : DEFAULT_DECOR;
    
    if (style === EmojiStyle.CUSTOM) {
        return " " + faces[0] + decorList[0]; 
    }
    
    const face = faces[Math.floor(Math.random() * faces.length)];
    const decorCount = Math.floor(Math.random() * 3) + 1;
    let decor = "";
    for(let i=0; i<decorCount; i++) decor += decorList[Math.floor(Math.random() * decorList.length)];
    return " " + face + decor;
  };

  const createResultsFromPhrases = (phrases: Phrase[]): GeneratedResult[] => {
    return phrases.map((p, idx) => ({
      base: p,
      emoji: generateEmoji(emojiStyle),
      id: Date.now() + idx + Math.random().toString()
    }));
  };

  const getRandomPhrases = (phrases: Phrase[], count: number): Phrase[] => {
    const shuffled = [...phrases].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // --- Handlers ---

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addXP(1);
    setHistoryLog(prev => [text, ...prev].slice(0, 20));
    setSettings(prev => ({ ...prev, totalCopies: prev.totalCopies + 1 }));
    unlockAchievement('first_copy');
    if (settings.totalCopies + 1 >= 50) unlockAchievement('copy_50');
    if (settings.totalCopies + 1 >= 500) unlockAchievement('copy_500');

    // Combo Logic
    const now = Date.now();
    if (now - copyTimeRef.current < 10000) {
        copyComboRef.current += 1;
        if(copyComboRef.current >= 5) unlockAchievement('combo_master');
    } else {
        copyComboRef.current = 1;
    }
    copyTimeRef.current = now;

    window.parent.postMessage({ type: 'TRACK_COPY', payload: text }, "*");
  };

  const handleSpeak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = settings.voiceRate;
    u.pitch = settings.voicePitch;
    window.speechSynthesis.speak(u);
    voiceCountRef.current += 1;
    if (voiceCountRef.current >= 10) unlockAchievement('voice_lover');
  };

  const toggleFavorite = (text: string) => {
    if (favorites.includes(text)) {
      setFavorites(prev => prev.filter(f => f !== text));
      unlockAchievement('fav_del');
    } else {
      if (favorites.length >= 24) { alert("我的最愛已滿 (24則)"); return; }
      setFavorites(prev => [...prev, text]);
      addXP(3);
      unlockAchievement('first_fav');
      if (favorites.length + 1 >= 24) unlockAchievement('fav_full');
    }
  };

  const toggleFeaturedCategory = (main: string, sub: string, label: string) => {
      const exists = savedCategories.find(c => c.main === main && c.sub === sub);
      if (exists) {
          setSavedCategories(prev => prev.filter(c => !(c.main === main && c.sub === sub)));
      } else {
          setSavedCategories(prev => [...prev, { main, sub, label }]);
      }
      addXP(3);
  };

  const handleSelectSub = (mainKey: string, subKey: string, fromFeatured = false) => {
    setCurrentMain(mainKey);
    setCurrentSub(subKey);
    if(fromFeatured) setIsDictExpanded(false); // If clicked from featured, we can collapse dict or keep as is.
    
    // Achievement Tracking for streaks
    if (subKey === "🔞 紳士讚美") {
         eroticStreakRef.current += 1;
         if(eroticStreakRef.current >= 10) unlockAchievement('erotic_fan');
    } else eroticStreakRef.current = 0;

    if (subKey === "🥰 單純可愛") {
         cuteStreakRef.current += 1;
         if(cuteStreakRef.current >= 10) unlockAchievement('pure_love');
    } else cuteStreakRef.current = 0;

    const subData = db[mainKey]?.subs[subKey];
    if (subData) {
      const selected = getRandomPhrases(subData.phrases, settings.resultCount);
      setResults(createResultsFromPhrases(selected));
      setStatus({ type: AppStatusType.SELECTED, text: subData.label });
    }
    regenCountRef.current = 0;
  };

  const handleRegen = () => {
    if (status.type !== AppStatusType.SELECTED || !currentMain || !currentSub) return;
    
    const subData = db[currentMain]?.subs[currentSub];
    if (subData) {
      const selected = getRandomPhrases(subData.phrases, settings.resultCount);
      setResults(createResultsFromPhrases(selected));
    }
    regenCountRef.current += 1;
    if (regenCountRef.current >= 20) unlockAchievement('regen_20');
  };

  const handleRerollEmoji = () => {
    setResults(prev => prev.map(r => ({ ...r, emoji: generateEmoji(emojiStyle) })));
  };

  const handleAiKeyword = async () => {
    if (!inputValue.trim()) return;
    setStatus({ type: AppStatusType.GEN_KEYWORD, text: '關鍵語句生成中...' });
    setResults([]);
    window.parent.postMessage({ type: 'REQUEST_BATCH_AI', context: { main: "Keyword", sub: inputValue } }, "*"); 
    
    const phrases = await generateKeywords(inputValue, settings.resultCount);
    setResults(createResultsFromPhrases(phrases));
    
    setStatus({ type: AppStatusType.IDLE, text: 'AI 生成完成' });
    setCurrentSub(null); 
    unlockAchievement('ai_awakening');
  };

  const handleAiReply = async () => {
    if (!inputValue.trim()) return;
    setStatus({ type: AppStatusType.GEN_REPLY, text: '回覆生成中...' });
    setResults([]);
    window.parent.postMessage({ type: 'REQUEST_BATCH_AI', context: { main: "Reply", sub: inputValue } }, "*"); 

    const phrases = await generateReply(inputValue, settings.resultCount);
    setResults(createResultsFromPhrases(phrases));
    
    setStatus({ type: AppStatusType.IDLE, text: 'AI 回覆完成' });
    setCurrentSub(null);
    unlockAchievement('ai_awakening');
  };

  const handleAiRewrite = async () => {
    if (results.length === 0) return;
    const context = currentSub ? db[currentMain!]?.subs[currentSub]?.label : "自訂";
    
    setStatus({ type: AppStatusType.AI_REWRITING, text: `${context} + AI改寫中...` });
    window.parent.postMessage({ type: 'REQUEST_BATCH_AI', context: { main: context, sub: "Rewrite" } }, "*");

    const originalPhrases = results.map(r => r.base);
    const rewritten = await rewritePhrases(originalPhrases, context || "");
    
    setResults(createResultsFromPhrases(rewritten));
    setStatus({ type: AppStatusType.IDLE, text: 'AI 改寫完成' });
    unlockAchievement('ai_awakening');
  };

  const handleSearch = () => {
      const query = inputValue.trim().toLowerCase();
      if(!query) return;
      unlockAchievement('first_search');
      
      const matches: Phrase[] = [];
      Object.values(db).forEach(main => {
          Object.values(main.subs).forEach(sub => {
              sub.phrases.forEach(p => {
                  if (p.jp.toLowerCase().includes(query) || p.cn.toLowerCase().includes(query)) {
                      matches.push(p);
                  }
              })
          })
      });
      
      if(matches.length === 0) {
          setStatus({ type: AppStatusType.IDLE, text: '找不到相關結果' });
          alert("找不到相關結果");
          return;
      }
      
      const selected = getRandomPhrases(matches, settings.resultCount);
      setResults(createResultsFromPhrases(selected));
      setCurrentMain(null);
      setCurrentSub(null);
      setStatus({ type: AppStatusType.IDLE, text: `搜尋：${inputValue}` });
  };

  const handleImportData = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              if(data.appSettings) setSettings(data.appSettings);
              if(data.favorites) setFavorites(data.favorites);
              if(data.savedSubCategories) setSavedCategories(data.savedSubCategories);
              if(data.userAchieve) setUserAchieve(data.userAchieve);
              alert("匯入成功！");
          } catch(err) { alert("匯入失敗"); }
      };
      reader.readAsText(file);
  };

  const handleExportData = () => {
      const data = { appSettings: settings, favorites, savedSubCategories: savedCategories, userAchieve };
      const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "gentleman_backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleTestVoice = () => {
      const u = new SpeechSynthesisUtterance("大好き");
      u.lang = 'ja-JP';
      u.rate = settings.voiceRate;
      u.pitch = settings.voicePitch;
      window.speechSynthesis.speak(u);
      if(settings.voiceRate >= 1.5) unlockAchievement('rap_god');
  };

  const handleSetEmojiStyle = (s: EmojiStyle) => {
      setEmojiStyle(s);
      if (s === EmojiStyle.KAOMOJI) unlockAchievement('kaomoji_fan');
  }

  const isRegenDisabled = status.type !== AppStatusType.SELECTED;
  const isAiRewriteDisabled = results.length === 0 || status.type === AppStatusType.GEN_REPLY || status.type === AppStatusType.GEN_KEYWORD || status.type === AppStatusType.AI_REWRITING;
  const userLevelTitle = LEVEL_TITLES[Math.floor(settings.userLevel / 10) * 10 + (settings.userLevel < 10 ? 1 : 0)] || LEVEL_TITLES[100];
  const isCurrentFeatured = currentMain && currentSub && savedCategories.some(c => c.main === currentMain && c.sub === currentSub);

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 max-w-3xl mx-auto flex flex-col font-sans relative">
      
      {/* Modals */}
      <WelcomeModal 
        isOpen={activeModal === 'welcome'} 
        onClose={() => setActiveModal(null)} 
        phrase={{ jp: welcomeData.jp, icon: welcomeData.icon }}
        date={new Date().toLocaleDateString()}
        stars={welcomeData.stars}
      />
      
      <SettingsModal 
        isOpen={activeModal === 'settings'} 
        onClose={() => setActiveModal(null)}
        settings={settings}
        setSettings={setSettings}
        onThemeChange={(t) => setSettings(p => ({...p, userTheme: t}))}
        onResetData={() => { if(confirm("Clear All?")) { localStorage.clear(); location.reload(); }}}
        onImportData={handleImportData}
        onExportData={handleExportData}
        onTestVoice={handleTestVoice}
      />

      <HistoryModal
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal(null)}
        history={historyLog}
        favorites={favorites}
        onCopy={handleCopy}
        onDeleteFav={toggleFavorite}
      />

      <AchievementsModal
        isOpen={activeModal === 'achievements'}
        onClose={() => setActiveModal(null)}
        achievements={ACHIEVEMENTS_DATA}
        userAchieve={userAchieve}
      />

      <TutorialModal
        isOpen={activeModal === 'tutorial'}
        onClose={() => setActiveModal(null)}
      />

      <LevelModal
        isOpen={activeModal === 'xp'}
        onClose={() => setActiveModal(null)}
        level={settings.userLevel}
        xp={settings.userXP}
        titles={LEVEL_TITLES}
        unlocks={UNLOCKS}
      />

      {/* Header */}
      <header className="py-6 flex justify-between items-center relative">
        <h1 className="text-xl sm:text-2xl font-black text-center w-full tracking-tight text-text">
          🎩 紳士ＡＩ讚美產生器
        </h1>
        <div 
            onClick={() => setActiveModal('settings')}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-card dark:bg-card-dark shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors z-10"
        >
          <Settings className="w-5 h-5 text-sub-text" />
        </div>
      </header>

      {/* Dictionary Section */}
      <div className="bg-card dark:bg-card-dark rounded-[32px] shadow-sm p-0 mb-3 transition-all overflow-hidden border border-white/50 dark:border-white/5">
        
        {/* Header - Expandable */}
        <div 
          onClick={() => setIsDictExpanded(!isDictExpanded)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
           <div className="flex items-center gap-2 text-sm font-extrabold text-text">
             <span>📂 預設辭庫</span>
             <ChevronDown size={16} className={`text-sub-text transition-transform duration-300 ${isDictExpanded ? 'rotate-180' : ''}`} />
           </div>
           
           {!isDictExpanded && (
               <button 
                onClick={(e) => { e.stopPropagation(); setCurrentMain('featured'); setIsDictExpanded(true); }}
                className="text-xs bg-bg dark:bg-zinc-800 text-text px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
               >
                 <Star size={12} className="text-yellow-500 fill-current" /> 精選
               </button>
           )}
        </div>

        {/* Content */}
        {isDictExpanded && (
          <div className="px-4 pb-4 animate-fade-in">
             {loading ? (
                <div className="text-center text-sub-text text-sm py-4">Loading database...</div>
             ) : (
                <>
                   {/* Main Cats */}
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                     {/* Featured Button */}
                     <button
                        onClick={() => setCurrentMain('featured')}
                        className={`
                          px-2 py-2 rounded-full text-sm font-bold transition-all duration-200 truncate flex items-center justify-center gap-1
                          ${currentMain === 'featured' 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md' 
                            : 'bg-bg dark:bg-zinc-800 text-sub-text hover:bg-slate-200 dark:hover:bg-zinc-700'}
                        `}
                      >
                         <Star size={12} fill="currentColor" /> 精選
                      </button>

                     {Object.entries(db).map(([key, cat]) => (
                       <button
                         key={key}
                         onClick={() => setCurrentMain(key === currentMain ? null : key)}
                         className={`
                           px-2 py-2 rounded-full text-sm font-medium transition-all duration-200 truncate
                           ${currentMain === key 
                             ? 'bg-primary text-white shadow-md transform scale-105' 
                             : 'bg-bg dark:bg-zinc-800 text-sub-text hover:bg-slate-200 dark:hover:bg-zinc-700'}
                         `}
                       >
                         {cat.label}
                       </button>
                     ))}
                   </div>
                   
                   {/* Divider */}
                   <div className="h-px bg-border w-full mb-4"></div>

                   {/* Sub Header */}
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-sub-text">
                        <span>📍 細部分類</span>
                      </div>
                      
                      {/* Add to Featured Button */}
                      {currentMain && currentMain !== 'featured' && currentSub && (
                          <button 
                            onClick={() => toggleFeaturedCategory(currentMain, currentSub, db[currentMain].subs[currentSub].label)}
                            className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-all
                              ${isCurrentFeatured 
                                ? 'bg-red-50 text-red-500 border border-red-200' 
                                : 'bg-bg dark:bg-zinc-800 text-sub-text hover:bg-slate-200'}
                            `}
                          >
                            {isCurrentFeatured ? '💔 移除' : '⭐ 加入'}
                          </button>
                      )}
                   </div>

                   {/* Sub Cats Grid */}
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 min-h-[40px]">
                      {currentMain === 'featured' ? (
                          savedCategories.length === 0 ? (
                              <div className="col-span-full text-center text-xs text-sub-text py-2">
                                  尚未有收藏的細項，請去其他分類點擊「⭐」加入
                              </div>
                          ) : (
                              savedCategories.map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSelectSub(item.main, item.sub, true)}
                                  className={`
                                    px-2 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 truncate
                                    ${currentSub === item.sub 
                                      ? 'bg-primary text-white shadow-md' 
                                      : 'bg-bg dark:bg-zinc-800 text-sub-text hover:bg-slate-200'}
                                  `}
                                >
                                  {item.label}
                                </button>
                              ))
                          )
                      ) : (
                         currentMain && db[currentMain] ? (
                            Object.entries(db[currentMain].subs).map(([key, sub]) => (
                                <button
                                  key={key}
                                  onClick={() => handleSelectSub(currentMain, key)}
                                  className={`
                                    px-2 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 truncate
                                    ${currentSub === key 
                                      ? 'bg-primary text-white shadow-md transform scale-105' 
                                      : 'bg-bg dark:bg-zinc-800 text-sub-text hover:bg-slate-200 dark:hover:bg-zinc-700'}
                                  `}
                                >
                                  {sub.label}
                                </button>
                            ))
                         ) : (
                             <div className="col-span-full text-center text-xs text-sub-text py-2">請選擇上方分類...</div>
                         )
                      )}
                   </div>
                </>
             )}
          </div>
        )}
      </div>

      {/* AI Input Section */}
      <div className="bg-card dark:bg-card-dark rounded-[32px] shadow-sm p-3 mb-4 flex flex-col sm:flex-row gap-2 border border-white/50 dark:border-white/5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAiKeyword()}
          placeholder="✨ 輸入關鍵字句 或 貼上粉絲留言..."
          className="flex-1 bg-bg dark:bg-zinc-800 border-none rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary text-text transition-all placeholder:text-sub-text"
        />
        <div className="flex gap-2">
          <button 
            onClick={handleAiKeyword}
            className="flex-1 sm:flex-none whitespace-nowrap bg-gradient-to-br from-secondary to-primary text-white px-5 py-3 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-transform hover:brightness-110"
          >
            AI 生成
          </button>
          <button 
            onClick={handleAiReply}
            className="flex-1 sm:flex-none whitespace-nowrap bg-gradient-to-br from-secondary to-primary text-white px-5 py-3 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-transform hover:brightness-110"
          >
            AI 回覆
          </button>
        </div>
      </div>

      {/* Status Bar & Tip */}
      <div className="flex items-center justify-between mb-2 px-3 gap-4">
        {/* Left: Status */}
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
             status.type === AppStatusType.IDLE ? 'bg-slate-300' : 
             status.type === AppStatusType.SELECTED ? 'bg-green-500' :
             'bg-primary animate-pulse'
          }`} />
          <span className={`text-xs font-bold truncate transition-colors duration-300 ${
            status.type !== AppStatusType.IDLE ? 'text-primary' : 'text-sub-text'
          }`}>
            {status.text}
          </span>
        </div>

        {/* Right: Tip */}
        <div className="text-[10px] sm:text-xs text-sub-text font-medium shrink-0 flex items-center gap-1 opacity-70">
          <span>💡 點選語句可複製，按鈕可刷新/修改/AI</span>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex flex-col gap-2 min-h-[100px]">
        {results.map((item, idx) => (
          <div 
            key={item.id}
            className="group bg-card dark:bg-card-dark rounded-[32px] p-0 flex overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in border border-white/50 dark:border-white/5"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {/* Main Text */}
            <div 
              onClick={() => handleCopy(item.base.jp + item.emoji)}
              className="flex-1 p-3 pl-5 flex items-center cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800"
            >
              <span className={`font-medium text-text break-all leading-snug
                ${settings.fontSize === 0 ? 'text-sm' : settings.fontSize === 1 ? 'text-base sm:text-lg' : 'text-xl'}
              `}>
                {item.base.jp}
                <span className="text-primary opacity-90">{item.emoji}</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center border-l border-border">
              {settings.showSpeak && (
                <button 
                  onClick={() => handleSpeak(item.base.jp)}
                  className="w-12 h-full flex items-center justify-center text-sub-text hover:text-red-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Volume2 size={20} />
                </button>
              )}
              <button 
                onClick={() => toggleFavorite(item.base.jp + item.emoji)}
                className={`w-12 h-full flex items-center justify-center transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 ${
                  favorites.includes(item.base.jp + item.emoji) ? 'text-yellow-400' : 'text-sub-text hover:text-yellow-400'
                }`}
              >
                <Star size={20} fill={favorites.includes(item.base.jp + item.emoji) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* CN Translation */}
            {settings.showCN && (
              <div className="w-24 sm:w-52 bg-bg dark:bg-zinc-900/50 p-2 pl-3 flex items-center text-xs sm:text-sm text-sub-text font-medium border-l border-border">
                {item.base.cn}
              </div>
            )}
          </div>
        ))}
        {results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-sub-text py-12 border-2 border-dashed border-border rounded-[32px]">
            <MessageCircle size={48} className="mb-2 opacity-20" />
            <span className="text-sm font-bold opacity-50">等待紳士指令...</span>
          </div>
        )}
      </div>

      {/* Control Panel (Unified) */}
      <div className="mt-4 bg-card dark:bg-card-dark rounded-[32px] p-3 shadow-sm flex flex-col gap-3 border border-white/50 dark:border-white/5">
        {/* Action Buttons Row */}
        <div className="flex gap-2">
          <button 
            onClick={handleRegen}
            disabled={isRegenDisabled}
            className={`
              flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all
              ${isRegenDisabled 
                ? 'bg-bg dark:bg-zinc-800 text-sub-text cursor-not-allowed' 
                : 'bg-primary text-white hover:brightness-110 active:scale-95 shadow-md'}
            `}
          >
            <RefreshCw size={16} className={!isRegenDisabled ? "active:rotate-180 transition-transform" : ""} />
            換一批
          </button>
          
          <button 
            onClick={handleRerollEmoji}
            disabled={results.length === 0}
            className={`
              flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all
              ${results.length === 0 
                ? 'bg-bg dark:bg-zinc-800 text-sub-text cursor-not-allowed' 
                : 'bg-primary text-white hover:brightness-110 active:scale-95 shadow-md'}
            `}
          >
            <Dices size={16} />
            換表符
          </button>
          
          <button 
            onClick={handleAiRewrite}
            disabled={isAiRewriteDisabled}
            className={`
              flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden
              ${isAiRewriteDisabled
                ? 'bg-bg dark:bg-zinc-800 text-sub-text cursor-not-allowed' 
                : 'bg-gradient-to-r from-secondary to-primary text-white hover:brightness-110 active:scale-95 shadow-md'}
            `}
          >
            {status.type === AppStatusType.AI_REWRITING ? (
               <span className="animate-pulse">改寫中...</span>
            ) : (
               <>
                 <Wand2 size={16} />
                 AI 改寫
               </>
            )}
          </button>
        </div>

        {/* Emoji Style Selectors */}
        <div className="flex gap-1 bg-transparent">
          {[
            { id: EmojiStyle.FACES, label: "臉+♡" },
            { id: EmojiStyle.KAOMOJI, label: "顏文字" },
            { id: EmojiStyle.EXCLAMATION, label: "驚嘆號" },
            { id: EmojiStyle.CUSTOM, label: "自訂" },
          ].map((opt) => (
             <button
               key={opt.id}
               onClick={() => handleSetEmojiStyle(opt.id)}
               className={`
                 flex-1 py-2 rounded-full text-xs font-bold transition-all border-2
                 ${emojiStyle === opt.id 
                   ? 'border-primary text-primary bg-primary/10' 
                   : 'border-transparent text-sub-text hover:bg-slate-50 dark:hover:bg-zinc-800'}
               `}
             >
               {opt.label}
             </button>
          ))}
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-8 mb-2 px-1 select-none cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveModal('xp')}>
        <div className="flex justify-between items-end mb-1">
          <div className="flex items-center gap-2">
            <span className="border border-sub-text text-sub-text text-[10px] px-2 py-0.5 rounded-full font-bold">LV.{settings.userLevel}</span>
            <span className="text-xs font-bold text-sub-text">{userLevelTitle}</span>
          </div>
          <span className="text-xs font-bold text-sub-text">{settings.userXP % 5}/5 XP</span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(settings.userXP % 5) / 5 * 100}%` }}
          />
        </div>
      </div>

      {/* Search & History Bar */}
      <div className="mt-2 bg-card dark:bg-card-dark rounded-full p-2 flex items-center shadow-sm border border-white/50 dark:border-white/5">
         <div className="flex gap-1 pr-2 border-r border-border">
            <button onClick={() => setActiveModal('history')} className="p-2 rounded-full text-sub-text hover:bg-bg transition-colors">
              <History size={18} />
            </button>
            <button onClick={() => setActiveModal('history')} className="p-2 rounded-full text-sub-text hover:bg-bg transition-colors">
              <Star size={18} className={favorites.length > 0 ? "text-yellow-400 fill-current" : ""} />
            </button>
            <button onClick={() => setActiveModal('achievements')} className="p-2 rounded-full text-sub-text hover:bg-bg transition-colors">
              <Trophy size={18} />
            </button>
         </div>
         <div className="flex-1 flex items-center px-3 gap-2">
            <Search size={16} className="text-sub-text" />
            <input 
              type="text" 
              placeholder="搜尋關鍵字..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent border-none outline-none text-sm text-text placeholder:text-sub-text"
            />
         </div>
         <button onClick={handleSearch} className="px-4 py-2 bg-bg dark:bg-zinc-800 rounded-full text-xs font-bold text-sub-text hover:bg-slate-200 dark:hover:bg-zinc-700">
           搜尋
         </button>
      </div>

      {/* Help Banner */}
      <div onClick={() => setActiveModal('tutorial')} className="mt-6 mx-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border border-blue-100 dark:border-slate-700">
          <span className="text-lg">📖</span>
          <span className="text-sm font-bold text-primary">點我看完整使用教學</span>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
           <a href="https://x.com/orz_can" target="_blank" className="py-2 border border-border rounded-full text-xs font-bold text-sub-text hover:bg-bg transition-colors">🍼 Twitter</a>
           <a href="https://www.paintcanfarm.com/" target="_blank" className="py-2 border border-border rounded-full text-xs font-bold text-sub-text hover:bg-bg transition-colors">🏠 Home</a>
           <a href="https://www.paypal.com/paypalme/paintcanfarm" target="_blank" className="py-2 border border-border rounded-full text-xs font-bold text-sub-text hover:bg-bg transition-colors">☕ PayPal</a>
           <a href="https://orzcan.fanbox.cc/" target="_blank" className="py-2 border border-border rounded-full text-xs font-bold text-sub-text hover:bg-bg transition-colors">🎨 Fanbox</a>
        </div>
        <p className="text-[10px] text-sub-text px-8 leading-relaxed opacity-60">
          AI 運算與伺服器維護皆需要持續的資金成本。如果您喜歡這項服務，懇請考慮小額贊助。<br/>
          Copyright ©2017-2026. 缶子牧場 All Rights Reserved.
        </p>
      </footer>

    </div>
  );
};

export default App;
