# EZ POS SYSTEM PRINT

EZ POS SYSTEMのレシート印刷システム。

POSアプリ：[EZ POS SYSTEM APP](https://github.com/opera7133/ez_pos_system_app)

カスタマーディスプレイ：[EZ POS SYSTEM WEB](https://github.com/opera7133/ez_pos_system_web)

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

```
pnpm i
pnpm run start
```

## 注意事項

[smareceipt](https://github.com/opera7133/smareceipt#注意)を参考にしてください。
