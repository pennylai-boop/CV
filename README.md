# 賴佩伶 Penny Lai — 履歷與作品集

純靜態網站（HTML / CSS / JS），無需建置。

- `index.html`：履歷 CV
- `portfolio.html`：作品集（大圖卡輪播＋作品詳細視窗）
- `css/`、`js/`、`assets/`：樣式、互動與圖片

## 本機預覽

```bash
python -m http.server 5500
```

## 部署（Cloud Run）

```bash
gcloud run deploy cv --source . --region asia-east1 --allow-unauthenticated
```
