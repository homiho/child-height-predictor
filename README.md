# 子どもの身長予測アプリ

日本人の成長曲線データに基づいて、お子様の将来の身長を予測するWebアプリケーションです。

## 特徴

- 厚生労働省の乳幼児身体発育曲線データに基づく予測
- 日単位での年齢入力が可能（特に0〜1歳児に便利）
- 1〜11ヶ月後の短期予測
- 1年後の予測
- 0歳児の週数表示機能
- 個人差を考慮した優しい表現

## GitHub Pagesでの公開方法

### 1. GitHubリポジトリの作成

```bash
# 新しいリポジトリを作成
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/child-height-predictor.git
git push -u origin origin main
```

### 2. GitHub Pagesの設定

1. GitHubのリポジトリページにアクセス
2. Settings > Pages に移動
3. Source で「main」ブランチを選択
4. 保存

数分後、以下のURLでアクセス可能になります：
`https://あなたのユーザー名.github.io/child-height-predictor/`

## ローカルでの実行

このプロジェクトはビルド不要で、直接ブラウザで開けます：

```bash
# シンプルなHTTPサーバーを起動（Python 3の場合）
python -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

または、index.htmlをブラウザで直接開くこともできます。

## 技術スタック

- React 18（CDN経由）
- Tailwind CSS（CDN経由）
- Babel Standalone（JSXのトランスパイル）

## 注意事項

このアプリの予測は統計的な目安です。実際の成長は個人差、遺伝、栄養状態、生活環境により異なります。成長に関して心配なことがあれば、健診や小児科でご相談ください。

## ライセンス

MIT License