## Getting Started
要將這份 Next.js 專案在本機電腦上順利運行起來，請按照以下步驟操作：

### 1. 確認開發環境 (Prerequisites)
請確保您的電腦已經安裝了以下環境：
- **[Node.js](https://nodejs.org/)** (建議 v18 或以上的 LTS 版本)
- **PostgreSQL** (因為專案使用了 Prisma，需要一個運作中的 PostgreSQL 資料庫來儲存文章與驗證資料)
- 一組可用的 **Cloudflare R2** 存儲桶 (Bucket)

### 2. 安裝依賴套件 (Installation)
請在終端機切換到專案根目錄，執行以下指令下載所有需要的套件：
```bash
npm install
