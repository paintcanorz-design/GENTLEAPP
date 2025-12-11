import React, { useState, useRef } from 'react';
import { AppSettings, AchievementDef, UserAchievement, EmojiStyle } from './types';
import { X, Trash2, RotateCcw, Download, Check, Star, Plus, Upload, Copy, Volume2, Type, BookOpen, Wand2, Palette, Trophy } from 'lucide-react';

// --- Shared Components ---
const ModalOverlay = ({ onClose, children }: { onClose: () => void, children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
    <div className="bg-card dark:bg-card-dark rounded-[32px] w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }: { title: string, onClose: () => void }) => (
  <div className="flex justify-between items-center p-5 border-b border-border bg-bg/50 dark:bg-zinc-900/50 backdrop-blur-md shrink-0">
    <h2 className="text-lg font-black tracking-tight">{title}</h2>
    <button onClick={onClose} className="p-2 rounded-full bg-border hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors active:scale-90">
      <X size={20} />
    </button>
  </div>
);

// --- Settings Modal ---
export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  setSettings,
  onThemeChange,
  onResetData,
  onImportData,
  onExportData,
  onTestVoice
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  settings: AppSettings, 
  setSettings: (s: AppSettings) => void,
  onThemeChange: (theme: string) => void,
  onResetData: () => void,
  onImportData: (file: File) => void,
  onExportData: () => void,
  onTestVoice: () => void
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [newEmojiInput, setNewEmojiInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const updateSetting = (key: keyof AppSettings, val: any) => {
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
    if (key === 'userTheme') onThemeChange(val as string);
  };

  const toggleEmoji = (listKey: 'activeFaces' | 'activeDecor', disabledKey: 'disabledFaces' | 'disabledDecor', emoji: string, isActive: boolean) => {
    const currentActive = settings[listKey] || [];
    const currentDisabled = settings[disabledKey] || [];
    
    let newActive = [...currentActive];
    let newDisabled = [...currentDisabled];

    if (isActive) {
      newActive = newActive.filter(e => e !== emoji);
      if (!newDisabled.includes(emoji)) newDisabled.push(emoji);
    } else {
      newDisabled = newDisabled.filter(e => e !== emoji);
      if (!newActive.includes(emoji)) newActive.push(emoji);
    }
    
    setSettings({ ...settings, [listKey]: newActive, [disabledKey]: newDisabled });
  };

  const addCustomEmoji = (listKey: 'activeFaces' | 'activeDecor') => {
    if (!newEmojiInput.trim()) return;
    const currentList = settings[listKey] || [];
    const newActive = [...currentList, newEmojiInput.trim()];
    setSettings({ ...settings, [listKey]: newActive });
    setNewEmojiInput('');
  };

  const themes = [
    { id: 'default', label: '🔵 預設藍', minLvl: 0 },
    { id: 'pink', label: '🌸 戀愛粉', minLvl: 10 },
    { id: 'mono', label: '🧘 賢者黑白', minLvl: 20 },
    { id: 'teal', label: '🌿 清新綠', minLvl: 30 },
    { id: 'wine', label: '🍷 酒紅', minLvl: 40 },
    { id: 'silver', label: '🥈 冷冽銀', minLvl: 50 },
    { id: 'purple', label: '🔮 夢幻紫', minLvl: 60 },
    { id: 'gold', label: '👑 帝王金', minLvl: 70 },
    { id: 'colorful', label: '🌈 繽紛', minLvl: 80 },
    { id: 'twitter', label: '✖️ X配色', minLvl: 90 },
    { id: 'orange', label: '🍊 愛馬仕橘', minLvl: 100 },
    { id: 'fanbox', label: '📦 Fanbox', minLvl: 110 },
    { id: 'youtube', label: '▶️ YT紅', minLvl: 120 },
    { id: 'tech', label: '🤖 科技藍', minLvl: 130 },
    { id: 'plurk', label: '🦴 噗浪', minLvl: 140 },
    { id: 'melon', label: '🍈 Melon', minLvl: 150 },
  ];

  const activeList = (activeTab === 'faces' ? settings.activeFaces : settings.activeDecor) || [];
  const disabledList = (activeTab === 'faces' ? settings.disabledFaces : settings.disabledDecor) || [];

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="⚙️ 詳細設定" onClose={onClose} />
      
      {/* Tabs */}
      <div className="flex gap-2 p-3 bg-bg dark:bg-zinc-900/50 mx-4 mt-4 rounded-2xl overflow-x-auto no-scrollbar shrink-0">
        {[
            { id: 'general', label: '🛠️ 一般' },
            { id: 'theme', label: '🏆 外觀' },
            { id: 'faces', label: '🙂 臉部' },
            { id: 'decor', label: '✨ 裝飾' },
            { id: 'custom', label: '🎨 自訂' },
            { id: 'data', label: '💾 資料' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-none py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
              ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary scale-105' 
              : 'text-sub-text hover:bg-white/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="bg-bg dark:bg-zinc-900/50 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-sub-text uppercase tracking-wider">顯示與外觀</h3>
                
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">深色模式</span>
                  <input 
                      type="checkbox" 
                      checked={settings.darkMode}
                      onChange={e => updateSetting('darkMode', e.target.checked)}
                      className="accent-primary w-5 h-5"
                  />
                </div>

                {/* Pure Mode (Hide Fun) */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">隱藏趣味性要素</span>
                  <input 
                      type="checkbox" 
                      checked={settings.hideFun}
                      onChange={e => updateSetting('hideFun', e.target.checked)}
                      className="accent-primary w-5 h-5"
                  />
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">字體大小</span>
                  <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-lg">
                    {[0, 1, 2].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSetting('fontSize', size)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          settings.fontSize === size 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-sub-text hover:bg-slate-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {size === 0 ? '小' : size === 1 ? '中' : '大'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result Count */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">一次生成數量 ({settings.resultCount})</span>
                  <input 
                      type="range" min="1" max="8" 
                      value={settings.resultCount}
                      onChange={e => updateSetting('resultCount', parseInt(e.target.value))}
                      className="accent-primary w-24 sm:w-32"
                  />
                </div>

                {/* Show CN */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">顯示中文翻譯</span>
                  <input 
                      type="checkbox" 
                      checked={settings.showCN}
                      onChange={e => updateSetting('showCN', e.target.checked)}
                      className="accent-primary w-5 h-5"
                  />
                </div>
            </div>

            <div className="bg-bg dark:bg-zinc-900/50 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-sub-text uppercase tracking-wider">語音設定 (TTS)</h3>
                <div className="flex items-center justify-between">
                <span className="font-bold text-sm">顯示發聲按鈕</span>
                <input 
                    type="checkbox" 
                    checked={settings.showSpeak}
                    onChange={e => updateSetting('showSpeak', e.target.checked)}
                    className="accent-primary w-5 h-5"
                />
                </div>
                <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-sub-text"><span>語速</span><span>{settings.voiceRate}</span></div>
                <input 
                    type="range" min="0.5" max="1.5" step="0.1"
                    value={settings.voiceRate}
                    onChange={e => updateSetting('voiceRate', parseFloat(e.target.value))}
                    className="w-full accent-primary"
                />
                </div>
                <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-sub-text"><span>音調</span><span>{settings.voicePitch}</span></div>
                <input 
                    type="range" min="0.5" max="1.5" step="0.1"
                    value={settings.voicePitch}
                    onChange={e => updateSetting('voicePitch', parseFloat(e.target.value))}
                    className="w-full accent-primary"
                />
                </div>
                <div className="flex justify-center pt-2">
                    <button onClick={onTestVoice} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 text-sm font-bold shadow-sm active:scale-95 transition-transform">
                        <Volume2 size={16} /> 試聽語音
                    </button>
                </div>
            </div>

            <a href="https://twitter.com/intent/tweet?text=%E6%88%91%E7%99%BC%E7%8F%BE%E4%BA%86%E4%B8%80%E5%80%8B%E8%B6%85%E5%A5%BD%E7%94%A8%E7%9A%84%E7%B4%B3%E5%A3%AB%E8%AE%9A%E7%BE%8E%E7%94%A2%E7%94%9F%E5%99%A8+%F0%9F%A4%A4%0A%0A%23%E7%B4%B3%E5%A3%AB%E8%AE%9A%E7%BE%8E%E7%94%A2%E7%94%9F%E5%99%A8+%23%E7%B4%B3%E5%A3%AB%E5%BF%85%E5%82%99+%23%E7%BC%B6%E5%AD%90%E7%89%A7%E5%A0%B4&url=https%3A%2F%2Fwww.paintcanfarm.com%2Ftool-praise-generator" target="_blank" className="block w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-center hover:opacity-90 transition-opacity">
                🐦 分享此工具到 X
            </a>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map(t => {
               const locked = settings.userLevel < t.minLvl;
               return (
                <button
                  key={t.id}
                  disabled={locked}
                  onClick={() => updateSetting('userTheme', t.id)}
                  className={`
                    p-3 rounded-2xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-2
                    ${settings.userTheme === t.id ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-bg dark:bg-zinc-800 text-sub-text'}
                    ${locked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-95 active:scale-90'}
                  `}
                >
                  <span className="text-base">{t.label.split(' ')[0]}</span>
                  <span>{t.label.split(' ')[1]}</span>
                  {locked && <span className="text-[10px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">Lv.{t.minLvl}</span>}
                </button>
               )
            })}
          </div>
        )}

        {(activeTab === 'faces' || activeTab === 'decor') && (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newEmojiInput}
                        onChange={e => setNewEmojiInput(e.target.value)}
                        placeholder="輸入新表情..."
                        className="flex-1 bg-bg dark:bg-zinc-900 border-none rounded-xl px-4 text-sm"
                    />
                    <button 
                        onClick={() => addCustomEmoji(activeTab === 'faces' ? 'activeFaces' : 'activeDecor')}
                        className="bg-primary text-white px-4 rounded-xl font-bold text-sm"
                    >
                        新增
                    </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                    {activeList.map((emoji, i) => (
                        <div key={'active-'+i} onClick={() => toggleEmoji(activeTab === 'faces' ? 'activeFaces' : 'activeDecor', activeTab === 'faces' ? 'disabledFaces' : 'disabledDecor', emoji, true)} className="aspect-square flex items-center justify-center bg-bg dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors text-lg">
                            {emoji}
                        </div>
                    ))}
                    {disabledList.map((emoji, i) => (
                        <div key={'disabled-'+i} onClick={() => toggleEmoji(activeTab === 'faces' ? 'activeFaces' : 'activeDecor', activeTab === 'faces' ? 'disabledFaces' : 'disabledDecor', emoji, false)} className="aspect-square flex items-center justify-center bg-transparent border border-dashed border-sub-text/30 text-sub-text/50 rounded-xl cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-500 transition-colors text-lg grayscale">
                            {emoji}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'custom' && (
            <div className="bg-bg dark:bg-zinc-900/50 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-sub-text uppercase tracking-wider">自訂表符數量</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">最少幾個？ ({settings.customMin || 3})</span>
                  <input 
                      type="range" min="1" max="10" 
                      value={settings.customMin || 3}
                      onChange={e => {
                          const val = parseInt(e.target.value);
                          const max = settings.customMax || 5;
                          updateSetting('customMin', val > max ? max : val);
                      }}
                      className="accent-primary w-24 sm:w-32"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">最多幾個？ ({settings.customMax || 5})</span>
                  <input 
                      type="range" min="1" max="10" 
                      value={settings.customMax || 5}
                      onChange={e => {
                          const val = parseInt(e.target.value);
                          const min = settings.customMin || 3;
                          updateSetting('customMax', val < min ? min : val);
                      }}
                      className="accent-primary w-24 sm:w-32"
                  />
                </div>
            </div>
        )}

        {activeTab === 'data' && (
             <div className="grid grid-cols-2 gap-3">
                <button onClick={onExportData} className="flex flex-col items-center justify-center gap-2 p-4 bg-bg dark:bg-zinc-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                    <Download className="text-primary" />
                    <span className="text-xs font-bold">匯出檔案</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-4 bg-bg dark:bg-zinc-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                    <Upload className="text-primary" />
                    <span className="text-xs font-bold">匯入檔案</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={e => {
                    if (e.target.files?.[0]) onImportData(e.target.files[0]);
                }} />
                
                <button onClick={onResetData} className="col-span-2 mt-4 py-4 rounded-2xl border-2 border-red-500 text-red-500 font-bold bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  <span>完全重置所有資料</span>
                </button>
             </div>
        )}
      </div>
    </ModalOverlay>
  );
};

// --- Level Modal ---
export const LevelModal = ({
    isOpen,
    onClose,
    level,
    xp,
    titles,
    unlocks
}: {
    isOpen: boolean,
    onClose: () => void,
    level: number,
    xp: number,
    titles: Record<number, string>,
    unlocks: Record<number, string>
}) => {
    if (!isOpen) return null;

    const currentTitle = titles[Math.floor(level / 10) * 10 + (level < 10 ? 1 : 0)] || titles[100];
    const nextLevelXP = 5; 

    return (
        <ModalOverlay onClose={onClose}>
            <ModalHeader title="📊 紳士等級與獎勵" onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Current Stats */}
                <div className="bg-bg dark:bg-zinc-900/50 rounded-2xl p-5 text-center">
                    <div className="inline-block px-3 py-1 rounded-full border border-sub-text/30 text-xs font-bold text-sub-text mb-2">
                        LV.{level}
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-1">{currentTitle}</h3>
                    <div className="text-xs font-bold text-sub-text mb-4">
                        當前經驗值: {xp % 5} / {nextLevelXP} XP
                    </div>
                    <div className="w-full h-3 bg-white dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                           className="h-full bg-primary rounded-full transition-all duration-500"
                           style={{ width: `${(xp % 5) / 5 * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-sub-text mt-2 px-1">
                        <span>複製語句 +1 XP</span>
                        <span>收藏/精選 +3 XP</span>
                    </div>
                </div>

                {/* Unlock List */}
                <div>
                    <h4 className="text-sm font-bold text-sub-text mb-3 px-1 border-b border-border pb-2">🎁 等級獎勵</h4>
                    <div className="space-y-2">
                        {Object.entries(unlocks).sort((a,b) => Number(a[0]) - Number(b[0])).map(([lvl, reward]) => {
                            const l = Number(lvl);
                            const unlocked = level >= l;
                            return (
                                <div key={lvl} className={`flex justify-between items-center text-xs p-2 rounded-lg ${unlocked ? 'text-text bg-green-500/5' : 'text-sub-text opacity-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold px-2 py-0.5 rounded ${unlocked ? 'bg-primary text-white' : 'bg-sub-text/20'}`}>LV.{l}</span>
                                        <span className="font-medium">{reward}</span>
                                    </div>
                                    {unlocked && <Check size={14} className="text-primary" />}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Title List */}
                <div>
                    <h4 className="text-sm font-bold text-sub-text mb-3 px-1 border-b border-border pb-2">🏷️ 稱號一覽</h4>
                     <div className="space-y-2">
                        {Object.entries(titles).sort((a,b) => Number(a[0]) - Number(b[0])).map(([lvl, title]) => {
                             const l = Number(lvl);
                             const unlocked = level >= l;
                             return (
                                <div key={lvl} className={`flex justify-between items-center text-xs p-2 rounded-lg ${unlocked ? 'text-text' : 'text-sub-text opacity-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold`}>LV.{l}</span>
                                        <span className="font-medium">{title}</span>
                                    </div>
                                    {unlocked && <Check size={14} className="text-primary" />}
                                </div>
                             )
                        })}
                     </div>
                </div>

            </div>
        </ModalOverlay>
    );
}

// --- History Modal ---
export const HistoryModal = ({ 
  isOpen, 
  onClose, 
  history, 
  favorites,
  onCopy,
  onDeleteFav
}: {
  isOpen: boolean,
  onClose: () => void,
  history: string[],
  favorites: string[],
  onCopy: (text: string) => void,
  onDeleteFav: (text: string) => void
}) => {
  const [activeTab, setActiveTab] = useState<'history'|'fav'>('history');

  if (!isOpen) return null;

  const list = activeTab === 'history' ? history : favorites;

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="📜 紀錄與收藏" onClose={onClose} />
      <div className="flex gap-2 p-4 pb-0">
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-md' : 'bg-bg dark:bg-zinc-800 text-sub-text'}`}
        >
          歷史紀錄
        </button>
        <button 
          onClick={() => setActiveTab('fav')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'fav' ? 'bg-primary text-white shadow-md' : 'bg-bg dark:bg-zinc-800 text-sub-text'}`}
        >
          我的最愛
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
        {list.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-sub-text opacity-50 gap-2">
            <div className="text-4xl">📭</div>
            <span className="text-sm font-bold">尚無資料</span>
          </div>
        ) : (
          list.map((text, i) => (
            <div key={i} className="p-4 rounded-2xl bg-bg dark:bg-zinc-800 flex justify-between items-center group active:scale-[0.98] transition-transform">
              <span className="flex-1 truncate cursor-pointer font-medium text-text text-sm" onClick={() => onCopy(text)}>{text}</span>
              <div className="flex items-center gap-2 pl-2">
                  <button onClick={() => onCopy(text)} className="p-2 text-sub-text hover:text-primary transition-colors">
                    <Copy size={16} />
                  </button>
                  {activeTab === 'fav' && (
                    <button onClick={() => onDeleteFav(text)} className="p-2 text-sub-text hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </ModalOverlay>
  );
};

// --- Achievements Modal ---
export const AchievementsModal = ({
  isOpen,
  onClose,
  achievements,
  userAchieve
}: {
  isOpen: boolean,
  onClose: () => void,
  achievements: Record<string, AchievementDef>,
  userAchieve: Record<string, UserAchievement>
}) => {
  if (!isOpen) return null;

  const sortedKeys = Object.keys(achievements).sort((a, b) => {
    const unlockedA = userAchieve[a]?.unlocked ? 1 : 0;
    const unlockedB = userAchieve[b]?.unlocked ? 1 : 0;
    return unlockedB - unlockedA; // Unlocked first
  });

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="🏆 成就徽章" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedKeys.map(key => {
          const def = achievements[key];
          const status = userAchieve[key];
          const isUnlocked = status?.unlocked;
          
          return (
            <div key={key} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              isUnlocked ? 'border-primary/20 bg-primary/5' : 'border-transparent bg-bg dark:bg-zinc-800 opacity-60 grayscale'
            }`}>
              <div className={`w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-full shadow-sm overflow-hidden flex-shrink-0 ${def.icon.length > 2 ? 'text-[9px] break-all p-1 leading-none' : 'text-xl'}`}>
                {isUnlocked ? def.icon : '🔒'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm truncate text-text">{def.title}</h3>
                  {isUnlocked && <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">已解鎖</span>}
                </div>
                <p className="text-xs text-sub-text truncate leading-relaxed">{def.desc}</p>
                {isUnlocked && <p className="text-[10px] text-sub-text mt-1 opacity-60">{new Date(status.date).toLocaleDateString()}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </ModalOverlay>
  );
};

// --- Tutorial Modal ---
export const TutorialModal = ({
    isOpen,
    onClose
}: {
    isOpen: boolean,
    onClose: () => void
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            <ModalHeader title="📖 使用教學" onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <p className="text-sm text-text font-medium leading-relaxed">
                      歡迎使用 <strong>紳士 AI 產生器</strong>！這是一個專為粉絲、創作者與紳士們打造的讚美與梗圖產生工具。
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border pb-2">
                        <BookOpen size={18} />
                        <h3>1. 基礎操作</h3>
                    </div>
                    <ul className="text-sm text-sub-text space-y-3 pl-2">
                        <li>
                            <strong className="text-text block mb-1">📂 瀏覽辭庫</strong>
                            點擊上方「預設辭庫」展開分類列表。
                        </li>
                        <li>
                            <strong className="text-text block mb-1">📍 選擇情境</strong>
                            點擊具體的細項（如：單純可愛、帥氣），系統將立即隨機生成語句。
                        </li>
                        <li>
                            <strong className="text-text block mb-1">📋 一鍵複製</strong>
                            看到喜歡的句子？直接點擊文字區域即可複製到剪貼簿。
                        </li>
                    </ul>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border pb-2">
                        <Wand2 size={18} />
                        <h3>2. AI 賦能</h3>
                    </div>
                    <ul className="text-sm text-sub-text space-y-3 pl-2">
                        <li>
                            <strong className="text-text block mb-1">⌨️ 自訂關鍵字</strong>
                            在輸入框輸入關鍵字（例如「女僕」、「傲嬌」），按下「AI 生成」獲得專屬讚美。
                        </li>
                        <li>
                            <strong className="text-text block mb-1">💬 AI 回覆</strong>
                            貼上對方說的話，按下「AI 回覆」，讓 AI 幫你想出得體又有趣的應答。
                        </li>
                        <li>
                            <strong className="text-text block mb-1">🪄 魔法改寫</strong>
                            覺得生成的句子不夠味？點擊下方「AI 改寫」，讓 AI 重新潤飾當前所有結果。
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border pb-2">
                        <Palette size={18} />
                        <h3>3. 個性化與裝飾</h3>
                    </div>
                    <ul className="text-sm text-sub-text space-y-3 pl-2">
                        <li>
                            <strong className="text-text block mb-1">😊 表情風格</strong>
                            透過下方按鈕切換「臉+♡」、「顏文字」或「驚嘆號」風格，甚至可以在設定中自訂專屬表情組合。
                        </li>
                        <li>
                            <strong className="text-text block mb-1">🔊 語音朗讀</strong>
                            點擊 🔊 圖示，聆聽日語發音（可於設定調整語速與音調）。
                        </li>
                        <li>
                            <strong className="text-text block mb-1">⭐ 收藏與精選</strong>
                            點擊星星收藏語句，或將常用的細分類加入「精選」以便快速訪問。
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border pb-2">
                        <Trophy size={18} />
                        <h3>4. 等級與成就</h3>
                    </div>
                    <p className="text-sm text-sub-text leading-relaxed pl-2">
                        您的每一次互動（複製、收藏、生成）都會累積 <strong>XP 經驗值</strong>。<br/>
                        隨著等級提升，您將獲得<strong>專屬稱號</strong>並解鎖更多繽紛的<strong>介面主題顏色</strong>！
                    </p>
                </div>
            </div>
             <div className="p-4 border-t border-border">
                <button onClick={onClose} className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                    我知道了
                </button>
            </div>
        </ModalOverlay>
    );
}

// --- Welcome Modal ---
export const WelcomeModal = ({
  isOpen,
  onClose,
  phrase,
  date,
  stars
}: {
  isOpen: boolean,
  onClose: () => void,
  phrase: { jp: string, icon: string },
  date: string,
  stars: number
}) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
      const element = document.getElementById('welcome-card-content');
      if (!element) return;
      // @ts-ignore
      if (window.html2canvas) {
          // @ts-ignore
          const canvas = await window.html2canvas(element, { backgroundColor: null, scale: 2 });
          const link = document.createElement('a');
          link.download = `gentleman_fortune_${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      } else {
          alert("Image generation library not loaded.");
      }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm bg-card dark:bg-card-dark rounded-[40px] overflow-hidden shadow-2xl animate-bounce-small" onClick={e => e.stopPropagation()}>
         <div id="welcome-card-content" className="p-8 pb-10 bg-gradient-to-b from-white to-slate-50 dark:from-zinc-800 dark:to-black text-center relative border-b border-border">
            <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-black tracking-widest shadow-lg shadow-primary/30 mb-6 uppercase">
              ✨ 今日紳士運勢 ✨
            </div>
            <div className="text-xs font-bold text-sub-text mb-8 opacity-60 flex items-center justify-center gap-4">
               <div className="h-px bg-border w-12"></div>
               {date}
               <div className="h-px bg-border w-12"></div>
            </div>
            
            <div className="text-7xl mb-6 drop-shadow-xl animate-pulse">{phrase.icon}</div>
            <h2 className="text-2xl font-black mb-3 leading-snug text-text">{phrase.jp}！</h2>
            <div className="text-sm font-medium text-sub-text bg-bg dark:bg-zinc-800/50 inline-block px-4 py-1 rounded-full">
               紳士指數：
               <span className="text-yellow-400 drop-shadow-sm ml-1">{"⭐".repeat(stars)}</span>
            </div>
         </div>
         <div className="flex bg-bg dark:bg-zinc-900 p-4 gap-3">
             <button onClick={handleDownload} className="flex-1 py-4 rounded-[20px] bg-card dark:bg-zinc-800 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors text-text">
                📥 存圖
             </button>
             <button onClick={onClose} className="flex-[1.5] py-4 rounded-[20px] bg-primary text-white text-sm font-bold shadow-xl shadow-primary/30 active:scale-95 transition-transform">
                🚀 開始
             </button>
         </div>
      </div>
    </div>
  );
};