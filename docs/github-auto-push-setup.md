# n8n 自動上傳到 GitHub Pages 設定指南

## 📋 概述

本指南說明如何設定 n8n 自動將新聞文章上傳到 GitHub，觸發 GitHub Pages 自動部署。

---

## 步驟 1：建立 GitHub Personal Access Token

1. 前往 https://github.com/settings/tokens?type=beta
2. 點擊 **Generate new token**
3. 設定：
   - **Token name**: `n8n-auto-push`
   - **Expiration**: 90 天
   - **Repository access**: 選擇 `Only select repositories` → `ai-nexus`
   - **Permissions**:
     - **Contents**: Read and write
4. 點擊 **Generate token**
5. **複製 Token 並保存**

---

## 步驟 2：在 n8n 中設定 GitHub Credential

1. 開啟 n8n (http://localhost:5678)
2. 前往 **Settings** → **Credentials**
3. 點擊 **Add Credential**
4. 搜尋 **GitHub API**
5. 填入：
   - **Access Token**: 貼上你的 Personal Access Token
6. 點擊 **Save**

---

## 步驟 3：在 Workflow 中新增 GitHub 節點

在 "Generate Markdown" 節點之後，新增以下節點：

### 節點 1：Upload to GitHub (HTTP Request)

```
節點類型: HTTP Request
名稱: Upload to GitHub

參數：
- Method: PUT
- URL: https://api.github.com/repos/CaoCharles/ai-nexus/contents/site/_posts/{{ $json.filename }}
- Authentication: Predefined Credential Type → GitHub API
- Send Headers: Yes
  - Accept: application/vnd.github.v3+json
- Send Body: Yes
  - Body Content Type: JSON
  - Body Parameters:
    - message: "Auto update: {{ $json.filename }}"
    - content: {{ $json.content_base64 }}
    - branch: main
```

---

## 步驟 4：修改 Generate Markdown 節點

需要在 Generate Markdown 節點輸出中加入 `filename` 和 `content_base64`：

```javascript
// 在 Generate Markdown 節點的最後加入
const filename = `${today}-ai-news.md`;
const content = report; // Markdown 內容
const content_base64 = Buffer.from(content).toString('base64');

return [{
  json: {
    filename: filename,
    content: content,
    content_base64: content_base64,
    // ... 其他欄位
  }
}];
```

---

## 步驟 5：處理檔案已存在的情況

如果檔案已存在，需要先取得 SHA：

### 節點：Get File SHA (HTTP Request)

```
Method: GET
URL: https://api.github.com/repos/CaoCharles/ai-nexus/contents/site/_posts/{{ $json.filename }}
Authentication: GitHub API
Continue On Fail: Yes (重要！)
```

然後在 Upload 節點中加入 SHA：
```
Body Parameters:
- sha: {{ $('Get File SHA').item.json.sha || '' }}
```

---

## 完整流程圖

```
[Generate Markdown] 
    ↓
[Get File SHA] (取得現有檔案的 SHA，如果存在)
    ↓
[Upload to GitHub] (使用 GitHub API 上傳/更新檔案)
    ↓
[GitHub Actions 自動觸發] → [GitHub Pages 更新]
```

---

## 快速設定方式

你也可以直接在 n8n 中匯入以下 JSON 片段（新增 GitHub 上傳節點）：

```json
{
  "parameters": {
    "method": "PUT",
    "url": "=https://api.github.com/repos/CaoCharles/ai-nexus/contents/site/_posts/{{ $json.filename }}",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "githubApi",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Accept",
          "value": "application/vnd.github.v3+json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "message",
          "value": "=Auto update: {{ $json.filename }}"
        },
        {
          "name": "content",
          "value": "={{ $json.content_base64 }}"
        },
        {
          "name": "branch",
          "value": "main"
        }
      ]
    },
    "options": {}
  },
  "name": "Upload to GitHub",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [2500, 300],
  "credentials": {
    "githubApi": {
      "id": "github-api",
      "name": "GitHub API"
    }
  }
}
```

---

## 測試

1. 在 n8n 中手動執行 workflow
2. 檢查 GitHub repository 是否有新的 commit
3. 檢查 GitHub Actions 是否自動觸發
4. 訪問 https://caocharles.github.io/ai-nexus/ 確認更新
