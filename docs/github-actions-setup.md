# GitHub Actions 與 GitHub Pages 設定指南

本文件記錄了 AI Nexus 專案的 CI/CD 設定過程。

## 目錄

- [為什麼需要 GitHub Actions](#為什麼需要-github-actions)
- [Workflow 設計](#workflow-設計)
- [設定步驟](#設定步驟)
- [設定過程錄影](#設定過程錄影)

---

## 為什麼需要 GitHub Actions

### 問題

1. **手動部署繁瑣**：每次更新程式碼後，需要手動執行 build 並上傳到伺服器
2. **內容更新自動化**：n8n 會自動產生新的 markdown 文章，需要自動轉換成網站內容
3. **確保品質**：自動化建置可以及早發現編譯錯誤

### 解決方案

使用 **GitHub Actions** 實現：
- 每次 push 到 `main` 分支時自動觸發
- 自動執行 `generate-articles.cjs` 將 markdown 轉換為 TypeScript
- 自動建置 React 應用程式
- 自動部署到 GitHub Pages

---

## Workflow 設計

### 檔案位置

```
.github/workflows/deploy.yml
```

### 完整 Workflow 程式碼

```yaml
name: Deploy AI Nexus to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Generate articles from markdown
        working-directory: frontend
        run: node scripts/generate-articles.cjs

      - name: Build
        working-directory: frontend
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Workflow 解說

#### 1. 觸發條件 (`on`)

```yaml
on:
  push:
    branches: ["main"]
  workflow_dispatch:
```

- `push`: 每次推送到 `main` 分支時自動執行
- `workflow_dispatch`: 允許在 GitHub Actions 頁面手動觸發

#### 2. 權限設定 (`permissions`)

```yaml
permissions:
  contents: read      # 讀取 repository 內容
  pages: write        # 寫入 GitHub Pages
  id-token: write     # OIDC token，用於安全部署
```

#### 3. 並行控制 (`concurrency`)

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

確保同一時間只有一個部署流程在執行，避免衝突。

#### 4. Build Job

| 步驟 | 說明 |
|------|------|
| Checkout | 下載 repository 程式碼 |
| Setup Node.js | 設定 Node.js 20 環境，並快取 npm 依賴 |
| Install dependencies | 執行 `npm ci` 安裝依賴 |
| Generate articles | 執行 `generate-articles.cjs`，將 `content/_posts/` 的 markdown 轉換成 `articles.ts` |
| Build | 執行 `npm run build`，用 Vite 建置 React 應用程式 |
| Upload artifact | 將 `frontend/dist` 目錄上傳為 artifact |

#### 5. Deploy Job

| 步驟 | 說明 |
|------|------|
| needs: build | 等待 build job 完成 |
| Deploy to GitHub Pages | 使用 `actions/deploy-pages@v4` 部署 artifact 到 GitHub Pages |

---

## 設定步驟

### 步驟 1：創建 Workflow 檔案

1. 在專案根目錄創建 `.github/workflows/` 目錄
2. 創建 `deploy.yml` 檔案
3. 貼上上述 workflow 程式碼

### 步驟 2：設定 GitHub Pages

1. 前往 GitHub Repository 的 **Settings**
2. 點擊左側選單的 **Pages**
3. 在 **Build and deployment** 區塊找到 **Source**
4. 將 Source 從 `Deploy from a branch` 改為 **`GitHub Actions`**

> ⚠️ **重要**：如果沒有設定這一步，workflow 會失敗並顯示 "resource not accessible by integration" 錯誤

### 步驟 3：觸發部署

設定完成後，有兩種方式觸發部署：

1. **自動觸發**：Push 任何 commit 到 `main` 分支
2. **手動觸發**：前往 Actions 頁面，選擇 workflow，點擊 "Run workflow"

### 步驟 4：確認部署成功

1. 前往 **Actions** 頁面查看 workflow 執行狀態
2. 綠色勾勾表示成功
3. 訪問 `https://<username>.github.io/<repo-name>/` 確認網站

---

## 設定過程錄影

以下是設定 GitHub Pages 的完整過程錄影：

![GitHub Pages 設定過程](images/github-pages-setup.webp)

### 錄影內容說明

1. **0:00-0:05**：導航到 Repository Settings > Pages
2. **0:05-0:10**：點擊 Source 下拉選單
3. **0:10-0:15**：選擇 "GitHub Actions"
4. **0:15-0:30**：檢查 Actions 頁面，發現第一次執行失敗
5. **0:30-0:45**：點擊 "Re-run all jobs" 重新執行
6. **0:45-1:00**：確認重新執行成功

---

## 常見問題

### Q: Workflow 失敗顯示 "resource not accessible by integration"

**原因**：GitHub Pages 的 Source 還沒設定為 GitHub Actions

**解決方式**：
1. 前往 Settings > Pages
2. 將 Source 改為 "GitHub Actions"
3. 重新執行 workflow

### Q: 網站顯示 404

**可能原因**：
1. `vite.config.ts` 的 `base` 路徑設定錯誤
2. 確認 `base` 應該設定為 `'/ai-nexus/'`（repo 名稱）

### Q: 文章沒有更新

**解決方式**：
1. 確認 n8n 已經將新的 markdown 推送到 `content/_posts/`
2. 手動觸發一次 workflow，或 push 一個空 commit：
   ```bash
   git commit --allow-empty -m "trigger deploy"
   git push
   ```

---

## 相關連結

- [GitHub Actions 官方文件](https://docs.github.com/en/actions)
- [GitHub Pages 官方文件](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

---

*文件最後更新：2025-12-23*
