# EZ POS SYSTEM PRINT

EZ POS SYSTEMのレシート印刷システム。

## 使い方

1. `config/example.json`を`config/default.json`にコピーして設定

```json5
{
  // 接続方法（"usb" or "bluetooth"）
  "mode": "bluetooth",
  "shop": {
    // レシートに記載される店舗名
    "name": "Example Shop",
    // 〃住所
    "address": "東京都新宿区西新宿2-8-1"
  },
  "firebase": {
    // Firebaseコンフィグ
    "apiKey": "",
    "authDomain": "",
    "projectId": "",
    "storageBucket": "",
    "messagingSenderId": "",
    "appId": ""
  }
}
```

2. いつもの

## 注意事項

[smareceipt](https://github.com/opera7133/smareceipt#注意)を参考にしてください。

```
pnpm i
pnpm run start
```
