# n8n 自動化 AI 趨勢抓取與網頁更新系統

> 每日自動追蹤 6 大 AI 模型最新動態，AI 生成中文圖文報導，部署至 GitHub Pages

---

## 1. 系統概述

本系統在本地端 Docker 環境中運行 n8n，每日自動抓取 6 大 AI 模型（Gemini、GPT、Claude、Grok、Mistral、Qwen）的最新趨勢與新聞，透過 GPT-4o 生成中文摘要文章，並自動部署到 GitHub Pages 靜態網站。

### 1.1 核心特色

- 🤖 **多模型追蹤**：同時追蹤 6 大主流 LLM 的最新動態
- 🔄 **全自動化**：每日定時執行，無需人工介入
- 🌐 **雙語處理**：英文來源 + AI 翻譯成中文
- 📊 **分類呈現**：依「重大更新 / 論文 / 一般新聞」分類
- 🔍 **歷史搜尋**：永久保留所有文章，支援全站搜尋
- 🖼️ **圖文並茂**：自動抓取原文配圖

---

## 2. 追蹤目標

### 2.1 AI 模型清單

| 模型 | 公司 | 官方資源 | 搜尋關鍵字 |
|------|------|----------|------------|
| **GPT** | OpenAI | [OpenAI Blog](https://openai.com/blog) | `OpenAI GPT-4 GPT-5 ChatGPT` |
| **Gemini** | Google DeepMind | [Google AI Blog](https://blog.google/technology/ai/) | `Google Gemini Bard DeepMind` |
| **Claude** | Anthropic | [Anthropic News](https://www.anthropic.com/news) | `Anthropic Claude` |
| **Grok** | xAI | [xAI Blog](https://x.ai/blog) | `xAI Grok Elon Musk AI` |
| **Mistral** | Mistral AI | [Mistral Blog](https://mistral.ai/news/) | `Mistral AI Mixtral` |
| **Qwen** | Alibaba | [Qwen GitHub](https://github.com/QwenLM/Qwen) | `Qwen Alibaba 通義千問` |

### 2.2 資料來源類型

1. **官方 Blog / RSS Feeds**（優先）
2. **Google Custom Search API**（補充搜尋）
3. **HuggingFace Daily Papers**（論文來源）
4. **科技新聞網站**（TechCrunch、The Verge、VentureBeat）

---

## 3. 系統架構

```
┌─────────────────────────────────────────────────────────────────┐
│                        Local Docker Environment                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   n8n        │───▶│   SQLite     │───▶│   Markdown   │     │
│   │  Workflow    │    │   Database   │    │   Articles   │     │
│   └──────┬───────┘    └──────────────┘    └──────┬───────┘     │
│          │                                        │              │
│          ▼                                        ▼              │
│   ┌──────────────┐                        ┌──────────────┐      │
│   │  External    │                        │    Jekyll    │      │
│   │  APIs        │                        │    Build     │      │
│   │  - Google    │                        └──────┬───────┘      │
│   │  - OpenAI    │                               │              │
│   │  - RSS       │                               ▼              │
│   └──────────────┘                        ┌──────────────┐      │
│                                           │   GitHub     │      │
│                                           │   Push       │      │
│                                           └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │   GitHub Pages   │
                          │   Static Site    │
                          │   + Search       │
                          └──────────────────┘
```

---

## 4. n8n Workflow 設計

### 4.1 執行時間

- **頻率**：每日執行一次
- **時間**：台灣時間 (UTC+8) 早上 05:00
- **Cron 表達式**：`0 5 * * *` (以 Asia/Taipei 時區設定)

### 4.2 Workflow 流程

```
[Cron Trigger: 每日 05:00]
         │
         ▼
[Step 1: 抓取 RSS Feeds]
    ├── OpenAI Blog RSS
    ├── Google AI Blog RSS
    ├── Anthropic News
    ├── Mistral News
    └── HuggingFace Papers
         │
         ▼
[Step 2: Google Custom Search]
    ├── 搜尋各模型關鍵字
    ├── 過去 24 小時新聞
    └── 每模型約 10 次查詢
         │
         ▼
[Step 3: 資料整合與去重]
    ├── 合併所有來源
    ├── 去除重複文章
    └── 按模型分類
         │
         ▼
[Step 4: 抓取文章內容與圖片]
    ├── HTTP Request 取得全文
    ├── 提取主要圖片 URL
    └── 下載圖片到本地
         │
         ▼
[Step 5: GPT-4o 處理]
    ├── 生成中文摘要
    ├── 分類（重大更新/論文/一般新聞）
    └── 格式化為 Markdown
         │
         ▼
[Step 6: 儲存資料]
    ├── 寫入 SQLite 資料庫
    └── 生成 Markdown 文章檔案
         │
         ▼
[Step 7: Jekyll 建置]
    └── 執行 Jekyll build
         │
         ▼
[Step 8: GitHub 推送]
    ├── Git add, commit, push
    └── 觸發 GitHub Pages 部署
         │
         ▼
[Step 9: 完成通知]（可選）
    └── 發送 Email/Slack 通知
```

### 4.3 Workflow 節點清單

| 節點編號 | 節點類型 | 功能說明 |
|----------|----------|----------|
| 1 | Cron | 定時觸發（每日 05:00 UTC+8）|
| 2 | RSS Read | 讀取 OpenAI Blog RSS |
| 3 | RSS Read | 讀取 Google AI Blog RSS |
| 4 | HTTP Request | 爬取 Anthropic News 頁面 |
| 5 | HTTP Request | 爬取 Mistral News 頁面 |
| 6 | HTTP Request | 抓取 HuggingFace Papers |
| 7 | Google Custom Search | 搜尋 GPT 相關新聞 |
| 8 | Google Custom Search | 搜尋 Gemini 相關新聞 |
| 9 | Google Custom Search | 搜尋 Claude 相關新聞 |
| 10 | Google Custom Search | 搜尋 Grok 相關新聞 |
| 11 | Google Custom Search | 搜尋 Mistral 相關新聞 |
| 12 | Google Custom Search | 搜尋 Qwen 相關新聞 |
| 13 | Merge | 合併所有資料來源 |
| 14 | Code | 去重複與資料清理 |
| 15 | HTTP Request | 抓取文章全文 |
| 16 | HTTP Request | 下載文章圖片 |
| 17 | OpenAI | GPT-4o 生成中文摘要 |
| 18 | OpenAI | GPT-4o 分類與格式化 |
| 19 | SQLite | 寫入資料庫 |
| 20 | Write Binary File | 儲存 Markdown 檔案 |
| 21 | Execute Command | 執行 Jekyll build |
| 22 | Execute Command | Git push 到 GitHub |
| 23 | IF | 錯誤處理判斷 |
| 24 | Email / Slack | 發送通知（可選）|

---

## 5. 資料儲存設計

### 5.1 SQLite 資料庫結構

#### 資料表：`articles`

```sql
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- 基本資訊
    title TEXT NOT NULL,
    title_zh TEXT,                    -- 中文標題
    url TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,             -- 來源網站
    
    -- 分類
    model TEXT NOT NULL,              -- gemini/gpt/claude/grok/mistral/qwen
    category TEXT NOT NULL,           -- major_update/paper/general_news
    
    -- 內容
    summary TEXT,                     -- 原文摘要
    summary_zh TEXT,                  -- 中文摘要
    content_zh TEXT,                  -- 中文完整內容
    
    -- 圖片
    image_url TEXT,                   -- 原始圖片 URL
    image_local TEXT,                 -- 本地圖片路徑
    
    -- 時間戳記
    published_at DATETIME,            -- 原文發布時間
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 狀態
    is_published BOOLEAN DEFAULT 0,
    markdown_path TEXT                -- Markdown 檔案路徑
);

CREATE INDEX idx_model ON articles(model);
CREATE INDEX idx_category ON articles(category);
CREATE INDEX idx_published_at ON articles(published_at);
```

#### 資料表：`daily_reports`

```sql
CREATE TABLE daily_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_date DATE UNIQUE NOT NULL,
    
    -- 統計
    total_articles INTEGER DEFAULT 0,
    articles_by_model TEXT,           -- JSON: {"gpt": 5, "gemini": 3, ...}
    articles_by_category TEXT,        -- JSON: {"major_update": 2, ...}
    
    -- 文章關聯
    summary_zh TEXT,                  -- 當日總覽（中文）
    
    -- 狀態
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT 0
);
```

### 5.2 Markdown 文章結構

#### 目錄結構

```
ai-news-site/
├── _posts/                           # Jekyll 文章目錄
│   ├── models/                       # 依模型分類
│   │   ├── gpt/
│   │   │   └── 2024-12-20-gpt-daily.md
│   │   ├── gemini/
│   │   ├── claude/
│   │   ├── grok/
│   │   ├── mistral/
│   │   └── qwen/
│   └── categories/                   # 依類別分類
│       ├── major-updates/
│       ├── papers/
│       └── general-news/
├── assets/
│   └── images/
│       └── 2024/
│           └── 12/
│               └── 20/               # 按日期存放圖片
├── _data/
│   └── articles.json                 # 搜尋索引資料
├── _config.yml
└── index.html
```

#### 文章範本（每模型每日一篇）

```markdown
---
layout: post
title: "GPT 每日動態 - 2024年12月20日"
date: 2024-12-20
model: gpt
categories: [gpt, daily]
tags: [OpenAI, GPT-4, ChatGPT]
---

## 📌 今日重點

> OpenAI 發布 GPT-4 Turbo 重大更新...

## 🔥 重大更新

### OpenAI 發布 GPT-4 Turbo 新版本

![GPT-4 Turbo](/assets/images/2024/12/20/gpt4-turbo.jpg)

**原文來源**：[OpenAI Blog](https://openai.com/blog/...)

OpenAI 今日宣布...（中文摘要內容）

---

## 📄 相關論文

### 論文標題

...

---

## 📰 一般新聞

### 新聞標題

...

---

*本文由 AI 自動彙整翻譯，資料來源截至 2024-12-20 05:00 (UTC+8)*
```

---

## 6. 網站設計

### 6.1 技術選型

| 項目 | 選擇 | 說明 |
|------|------|------|
| **靜態網站生成器** | Jekyll | GitHub Pages 原生支援 |
| **搜尋功能** | Lunr.js / Algolia DocSearch | 免費全站搜尋 |
| **主題** | 自訂 或 Minimal Mistakes | 美觀且支援搜尋 |
| **部署** | GitHub Pages | 免費託管 |

### 6.2 頁面結構

```
首頁 (/)
├── 今日總覽
├── 各模型最新動態卡片
└── 快速搜尋框

模型專頁 (/models/gpt/)
├── GPT 所有文章列表
├── 依日期排序
└── 篩選（重大更新/論文/新聞）

分類頁面 (/categories/major-updates/)
├── 所有重大更新
├── 跨模型彙整
└── 時間軸呈現

搜尋頁面 (/search/)
├── 全站搜尋
├── 篩選條件（模型/分類/日期）
└── 搜尋結果列表

關於頁面 (/about/)
└── 系統說明
```

### 6.3 搜尋功能實作

使用 **Lunr.js** 實現前端搜尋：

1. n8n 每次更新時生成 `_data/search-index.json`
2. Jekyll 建置時載入索引
3. 前端 JavaScript 實現即時搜尋

```json
// _data/search-index.json 範例
[
  {
    "id": 1,
    "title": "GPT-4 Turbo 重大更新",
    "model": "gpt",
    "category": "major_update",
    "content": "OpenAI 發布...",
    "date": "2024-12-20",
    "url": "/models/gpt/2024-12-20-gpt-daily/"
  }
]
```

---

## 7. API 與憑證需求

### 7.1 必要 API

| API | 用途 | 免費額度 | 取得方式 |
|-----|------|----------|----------|
| **Google Custom Search API** | 搜尋新聞 | 100 次/天 | [Google Cloud Console](https://console.cloud.google.com/) |
| **OpenAI API** | GPT-4o 摘要生成 | 付費 | [OpenAI Platform](https://platform.openai.com/) |
| **GitHub Token** | 自動推送 | 無限 | [GitHub Settings](https://github.com/settings/tokens) |

### 7.2 環境變數設定

```env
# .env 檔案
# Google Custom Search
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_custom_search_engine_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# GitHub
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO=username/ai-news-site

# 可選：通知
SLACK_WEBHOOK_URL=your_slack_webhook
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

---

## 8. 錯誤處理與監控

### 8.1 錯誤處理策略

| 錯誤類型 | 處理方式 |
|----------|----------|
| RSS 讀取失敗 | 記錄日誌，繼續執行其他來源 |
| Google API 超過配額 | 暫停搜尋，使用快取資料 |
| OpenAI API 失敗 | 重試 3 次，失敗則保留原文 |
| 圖片下載失敗 | 使用預設佔位圖 |
| GitHub 推送失敗 | 發送通知，等待下次執行 |

### 8.2 日誌記錄

```
logs/
├── workflow-2024-12-20.log      # 每日執行日誌
├── errors-2024-12-20.log        # 錯誤日誌
└── api-usage.log                # API 使用統計
```

### 8.3 監控指標

- 每日抓取文章數量
- API 調用次數與剩餘配額
- 處理成功率
- 網站建置時間

---

## 9. 開發計劃

### Phase 1：n8n Workflow（優先）

- [ ] 設定 Docker + n8n 環境
- [ ] 建立 Google Custom Search API
- [ ] 實作 RSS 抓取節點
- [ ] 實作 Google 搜尋節點
- [ ] 實作資料整合與去重
- [ ] 實作 GPT-4o 摘要生成
- [ ] 實作 SQLite 資料庫儲存
- [ ] 實作 Markdown 檔案生成
- [ ] 測試完整 Workflow

### Phase 2：Jekyll 網站

- [ ] 初始化 Jekyll 專案
- [ ] 設計首頁與版面
- [ ] 建立模型專頁模板
- [ ] 建立分類頁面模板
- [ ] 實作 Lunr.js 搜尋功能
- [ ] 設定 GitHub Pages 部署
- [ ] 連接 n8n 自動推送

### Phase 3：優化與擴充

- [ ] 加入錯誤通知（Email/Slack）
- [ ] 優化 API 使用效率
- [ ] 加入快取機制
- [ ] 美化網站 UI
- [ ] 加入 RSS 輸出功能
- [ ] 加入訂閱功能（可選）

---

## 10. 預估資源使用

### 10.1 每日 API 使用量

| API | 預估使用量 | 免費額度 | 狀態 |
|-----|------------|----------|------|
| Google Custom Search | ~60 次 | 100 次/天 | ✅ 足夠 |
| OpenAI GPT-4o | ~30 次 | 付費 | 💰 約 $0.5/天 |

### 10.2 儲存空間

| 項目 | 預估大小 |
|------|----------|
| SQLite 資料庫（每月）| ~10 MB |
| 圖片（每月）| ~100 MB |
| Markdown 文章（每月）| ~5 MB |

---

## 11. 附錄

### 11.1 GPT-4o Prompt 範本

#### 摘要生成 Prompt

```
你是一位專業的 AI 科技新聞編輯。請將以下英文文章翻譯並整理成繁體中文摘要。

要求：
1. 使用繁體中文
2. 保持專業但易讀的語調
3. 摘要長度約 200-300 字
4. 保留重要技術細節
5. 標註資料來源

文章內容：
{article_content}

請輸出 JSON 格式：
{
  "title_zh": "中文標題",
  "summary_zh": "中文摘要",
  "category": "major_update|paper|general_news",
  "key_points": ["重點1", "重點2", "重點3"]
}
```

#### 每日綜覽 Prompt

```
請根據以下今日 AI 新聞列表，撰寫一份繁體中文的每日綜覽。

要求：
1. 開頭一段總結今日最重要的 1-2 則新聞
2. 依模型分類整理重點
3. 語調專業但有趣
4. 長度約 300-500 字

今日新聞：
{news_list}
```

### 11.2 RSS Feed 清單

| 來源 | RSS URL |
|------|---------|
| OpenAI Blog | `https://openai.com/blog/rss/` |
| Google AI Blog | `https://blog.google/technology/ai/rss/` |
| HuggingFace Papers | `https://huggingface.co/papers/rss` |
| VentureBeat AI | `https://venturebeat.com/category/ai/feed/` |
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` |

---

*文件版本：v1.0*  
*建立日期：2025-12-20*  
*最後更新：2025-12-20*