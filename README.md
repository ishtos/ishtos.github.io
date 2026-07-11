# 自己紹介ホームページ

エンジニア向けのプロフィールサイトです。深いチャコール基調の「ダーク・プロダクト」デザイン
（明朝体の見出し × 等幅のラベル × 抑えたブラスのアクセント）で、
**プロフィール / 経歴 / スキル・資格 / 実績 / 連絡先** を紹介します。

- 依存ライブラリなし（HTML + CSS + JS のみ）
- レスポンシブ対応・ダーク基調で統一
- スクロールで現在地をハイライト・要素がフェードイン（`prefers-reduced-motion` を尊重）
- フォントは Google Fonts（Shippori Mincho / Zen Kaku Gothic New / JetBrains Mono）

## ファイル構成

```
ishtos.github.io/
├─ index.html          ← 内容（文言）を編集する場所
├─ assets/
│  ├─ styles.css       ← 色・フォント・レイアウト
│  └─ main.js          ← スクロール演出・メニュー（編集不要）
└─ README.md
```

## 編集のしかた

`index.html` を開き、コメント `▼編集` が付いた箇所を書き換えてください。

| 変更したいもの | 場所 |
| --- | --- |
| 氏名・肩書き・キャッチコピー | `index.html` のヒーロー（`hero`）と `<title>` |
| 自己紹介・基本プロフィール | `about` セクション |
| 職歴（増減は `<li>` をコピー／削除） | `career` の `ledger` |
| スキル・資格 | `skills` の各 `chips` の `<li>` |
| 実績（増減は `<article>` をコピー／削除） | `work` セクション |
| 連絡先・SNS リンク | `contact` セクション |

**色を変えたいとき**は `assets/styles.css` 冒頭の `:root` にある
`--accent`（ブラスのアクセント色）や `--bg`（背景色）などを変更します。

### 日本語・英語の切り替え

右上の `JA / EN` で言語を切り替えます（選択はブラウザに記憶されます）。

- **日本語**は `index.html` の本文をそのまま表示します。
- **英語**は各要素の `data-en="..."` 属性の文言を表示します。英語を直したいときはこの属性を編集してください。
- 改行を入れたいときは英語側で `{br}` と書きます（例: `data-en="Let's{br}work together."`）。
- `data-en` の中で `&`（アンド）を使うときは `&amp;` と書きます。
- `Profile / Career` などの等幅ラベルやスペックシートはデザイン上、両言語で共通です。

### 写真を載せたい場合

`assets/` に画像を置き、`index.html` の該当箇所に
`<img src="assets/あなたの写真.jpg" alt="プロフィール写真" />` を追加してください。

## ローカルで確認する

`index.html` をブラウザにドラッグ＆ドロップするだけで確認できます。
（サーバー不要）

## GitHub Pages で公開する

このフォルダ名 `ishtos.github.io` は、GitHub の **ユーザーサイト** 用の名前です。
公開すると `https://ishtos.github.io/` でアクセスできます。

1. GitHub で `ishtos.github.io` という名前のリポジトリを作成（Public）
2. このフォルダで以下を実行:

   ```sh
   git init
   git add .
   git commit -m "Add profile site"
   git branch -M main
   git remote add origin https://github.com/ishtos/ishtos.github.io.git
   git push -u origin main
   ```

3. GitHub のリポジトリ → **Settings → Pages** を開く
4. **Build and deployment** の Source を **Deploy from a branch**、
   Branch を **main / (root)** に設定して Save
5. 数分後に `https://ishtos.github.io/` で公開されます

> プロジェクトサイト（例: `https://ishtos.github.io/portfolio/`）にしたい場合は、
> フォルダ名を任意のリポジトリ名に変えて同様に公開してください。
