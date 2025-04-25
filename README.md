# Exia Voiceroid Scenario Generator MCP Server

exia というノベルゲームエンジン向けのシナリオファイルを作成する MCP サーバです。「琴葉姉妹解説」形式のシナリオを生成し、exia で表示します。

## 機能

- 指定されたお題について「琴葉姉妹解説」形式のシナリオを生成
- 生成したシナリオを exia 用の JSON 形式に変換
- exia を GitHub からダウンロードしてセットアップ
- 生成したシナリオを exia で表示

## 必要条件

- Node.js v20.x 以上
- OpenAI API キー
- Git

## セットアップ

1. リポジトリをクローンまたはダウンロード

```bash
git clone https://github.com/yourusername/exia-mcp.git
cd exia-mcp
```

2. 必要なパッケージをインストール

```bash
npm install
```

3. `.env`ファイルを編集して OpenAI API キーを設定

```
OPENAI_API_KEY=your_api_key_here
```

4. TypeScript のコンパイル

```bash
npm run build
```

## Claude Desktop での利用方法

1. Claude Desktop を起動

2. 設定画面を開き、MCP サーバを追加

   - 名前: `Exia Voiceroid Scenario Generator`
   - コマンド: `npx`
   - 引数: `-y path/to/exia-mcp --openai-api-key=YOUR_API_KEY --stdio`
   - 作業ディレクトリ: `path/to/exia-mcp`（実際のパスに置き換えてください）

   ※ `YOUR_API_KEY` は実際の OpenAI API キーに置き換えてください

3. Claude Desktop で以下のように使用
   - 「exia で量子コンピュータについて解説して」と入力
   - MCP サーバが起動し、シナリオを生成して exia を起動
   - ブラウザで exia にアクセスしてシナリオをプレイ

## 利用可能なツール

- `generateScenario`: お題からシナリオを生成
- `setupExia`: exia をダウンロードしてセットアップ
- `saveScenario`: 生成したシナリオを保存
- `playExia`: exia を起動
- `exiaVoiceroidExplain`: 上記すべての処理を一括実行（推奨）

## 注意事項

- 初回実行時は exia のダウンロードとセットアップに時間がかかります
- キャラクター画像は自前で用意して手動で差し替える必要があります
- OpenAI API の利用には料金がかかる場合があります

## ライセンス

MIT
