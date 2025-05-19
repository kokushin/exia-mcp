# exia-scenario-generator MCP Server

[![smithery badge](https://smithery.ai/badge/@kokushin/exia-mcp)](https://smithery.ai/server/@kokushin/exia-mcp)

[exia](https://github.com/kokushin/exia) というノベルゲームエンジン向けのシナリオファイルを作成する MCP サーバです。  
「琴葉姉妹解説」形式のシナリオを生成し、exia で表示します。

<img width="800" alt="" src="https://github.com/user-attachments/assets/f02cc41a-6456-44d3-bb22-190cb899515d" />

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

### Smithery を使用したインストール

この MCP サーバを [Smithery](https://smithery.ai/server/@kokushin/exia-mcp) を使って自動的に Claude Desktop 用にインストールできます。

```bash
npx -y @smithery/cli install @kokushin/exia-mcp --client claude
```

### 手動インストール
1. リポジトリをクローンまたはダウンロード

```bash
git clone https://github.com/kokushin/exia-mcp.git
cd exia-mcp
```

2. 必要なパッケージをインストール

```bash
npm install
```

3. TypeScript のコンパイル (変更を加えたら実行してください)

```bash
npm run build
```

## Claude Desktop での利用方法

1. Claude Desktop を起動

2. 設定画面を開き、MCP サーバを追加

```json
{
  "mcpServers": {
    "exia-scenario-generator": {
      "command": "npx",
      "args": [
        "-y",
        "/path/to/exia-mcp", //（clone した exia-mcp のパスに置き換えてください）
        "--openai-api-key=YOUR_API_KEY", //（OpenAI API キーに置き換えてください）
        "--stdio"
      ]
    }
  }
}
```

- ※ `YOUR_API_KEY` は実際の OpenAI API キーに置き換えてください
- ※ `npx` が実行できない場合は絶対パスで指定してください `例: /path/to/.volta/bin/npx`

3. Claude Desktop で以下のように使用
   - 「exia で量子コンピュータについて解説して」と入力
   - MCP サーバが起動し、シナリオを生成して exia を起動
   - exia アプリケーション（Electron）が別ウィンドウで起動し、シナリオをプレイ

## 利用可能なツール

- `generateScenario`: お題からシナリオを生成
- `setupExia`: exia をダウンロードしてセットアップ
- `saveScenario`: 生成したシナリオを保存
- `exiaVoiceroidExplain`: シナリオ生成から exia 起動までを一括実行（推奨）

## 注意事項

- 初回実行時は exia のダウンロードとセットアップに時間がかかります
- キャラクター画像は自前で用意して手動で差し替える必要があります
  - exia のドキュメントは[こちら](https://github.com/kokushin/exia?tab=readme-ov-file#%E7%94%BB%E5%83%8F%E3%82%84%E3%82%B7%E3%83%8A%E3%83%AA%E3%82%AA%E3%82%92%E5%A4%89%E6%9B%B4%E3%81%97%E3%81%9F%E3%81%84%E5%A0%B4%E5%90%88)
- OpenAI API の利用には料金がかかる場合があります

## ライセンス

MIT
