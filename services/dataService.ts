import { Database, Phrase } from '../types';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSM6yn6wGB_TcdLtSDqQMiaDL3WICybpnSqDXqMn8sQ1XFLjiqdqqQib2bO1x7nAHrWYVK7VSrDU2io/pub?output=csv';

// Fallback data in case CSV fetch fails or for immediate initial load
const FALLBACK_DATA: Database = {
  "Reaction": {
    label: "⏫ 反應短句",
    subs: {
      "Cute": {
        label: "🥰 單純可愛",
        phrases: [
            { jp: "尊い...", cn: "太尊了..." },
            { jp: "好き...", cn: "好喜歡..." },
            { jp: "可愛い！", cn: "好可愛！" },
            { jp: "最高です！", cn: "最棒了！" },
            { jp: "癒やされる...", cn: "被治癒了..." }
        ]
      },
      "Cool": {
        label: "😎 帥氣",
        phrases: [
            { jp: "かっこいい...", cn: "好帥..." },
            { jp: "イケメン...", cn: "帥哥..." },
            { jp: "痺れる！", cn: "被迷倒了！" }
        ]
      }
    }
  },
  "Praise": {
    label: "💖 讚美",
    subs: {
        "Art": {
            label: "🎨 稱讚圖畫",
            phrases: [
                { jp: "神絵師...", cn: "神繪師..." },
                { jp: "色彩が素敵", cn: "色彩很棒" },
                { jp: "構図が天才", cn: "構圖是天才" }
            ]
        }
    }
  }
};

const cleanStr = (str: string) => str ? str.trim().replace(/^"|"$/g, '').trim() : '';

// Exported for Pure Mode in App.tsx
export const stripEmojis = (str: string) => {
    if (!str) return "";
    return str.replace(/[^\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u0020-\u007E\u00A0-\u00FF\u3000-\u303F]/g, '').replace(/\s+/g, ' ').trim();
};

export const fetchData = async (): Promise<Database> => {
    try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        const text = await response.text();
        
        const db: Database = {};
        const rows = text.split(/\r?\n/).slice(1); // Skip header

        rows.forEach(row => {
            if (!row.trim()) return;
            // Handle CSV parsing considering potential commas in quotes (simplified)
            const cols = row.split(','); 
            if (cols.length < 4) return;

            const mainKey = cleanStr(cols[0]);
            const subKey = cleanStr(cols[1]);
            const jpText = stripEmojis(cleanStr(cols[2]));
            const cnText = stripEmojis(cleanStr(cols[3]));

            if (!mainKey || !subKey || !jpText) return;

            if (!db[mainKey]) db[mainKey] = { label: mainKey, subs: {} };
            if (!db[mainKey].subs[subKey]) db[mainKey].subs[subKey] = { label: subKey, phrases: [] };
            
            db[mainKey].subs[subKey].phrases.push({ jp: jpText, cn: cnText });
        });

        // Merge with fallback if empty (or just use parsed)
        return Object.keys(db).length > 0 ? db : FALLBACK_DATA;
    } catch (error) {
        console.warn("Using fallback data due to fetch error:", error);
        return FALLBACK_DATA;
    }
};